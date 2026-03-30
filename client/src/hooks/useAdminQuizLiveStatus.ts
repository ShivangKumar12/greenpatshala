// client/src/hooks/useAdminQuizLiveStatus.ts
// Connects a single socket and subscribes to multiple quiz rooms
// Returns a Map<quizId, activeUsers> that updates in real-time
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
    (import.meta as any).env?.VITE_BACKEND_URL || window.location.origin;

/**
 * For admin panels: subscribes to multiple quiz rooms at once
 * and returns a map of quizId → active user count.
 *
 * Usage:
 *   const { liveStatus, isConnected } = useAdminQuizLiveStatus(quizIds);
 *   liveStatus.get(42) // → number of users on quiz 42
 */
export function useAdminQuizLiveStatus(quizIds: number[]) {
    const [liveStatus, setLiveStatus] = useState<Map<number, number>>(new Map());
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const joinedRef = useRef<Set<string>>(new Set());

    // Stable stringified IDs to avoid re-renders
    const idsKey = quizIds.map(String).sort().join(',');

    useEffect(() => {
        if (quizIds.length === 0) return;

        // Create socket if not yet created
        if (!socketRef.current) {
            const socket = io(SOCKET_URL, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                setIsConnected(true);
                // Re-join all current quiz rooms on reconnect
                joinedRef.current.forEach((id) => socket.emit('observeQuiz', id));
            });

            socket.on('disconnect', () => setIsConnected(false));

            socket.on('quizUserCount', (data: { quizId: string; count: number }) => {
                const numericId = Number(data.quizId);
                setLiveStatus((prev) => {
                    const next = new Map(prev);
                    next.set(numericId, Math.max(0, data.count));
                    return next;
                });
            });
        }

        const socket = socketRef.current;
        if (!socket) return;

        // Determine which rooms to join / leave
        const desired = new Set(quizIds.map(String));

        // Join new rooms
        desired.forEach((id) => {
            if (!joinedRef.current.has(id)) {
                socket.emit('observeQuiz', id);
                joinedRef.current.add(id);
            }
        });

        // Leave old rooms
        joinedRef.current.forEach((id) => {
            if (!desired.has(id)) {
                socket.emit('unobserveQuiz', id);
                joinedRef.current.delete(id);
            }
        });

        // Cleanup on unmount
        return () => {
            // We don't disconnect here—only when component fully unmounts (below)
        };
    }, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Full cleanup on true unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                joinedRef.current.forEach((id) => socketRef.current?.emit('unobserveQuiz', id));
                socketRef.current.disconnect();
                socketRef.current = null;
                joinedRef.current.clear();
            }
        };
    }, []);

    return { liveStatus, isConnected };
}
