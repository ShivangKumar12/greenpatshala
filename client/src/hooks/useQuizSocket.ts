// client/src/hooks/useQuizSocket.ts — Real-time quiz active-users counter via Socket.io
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
    (import.meta as any).env?.VITE_BACKEND_URL || window.location.origin;

/**
 * Connects to the Socket.io server, joins a quiz room,
 * and returns the live count of active users taking this quiz.
 *
 * Usage:
 *   const { activeUsers, isConnected } = useQuizSocket(quizId);
 */
export function useQuizSocket(quizId: string | number | undefined) {
    const [activeUsers, setActiveUsers] = useState<number>(0);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!quizId) return;

        const id = String(quizId);

        // Create socket connection (auto-reconnect enabled by default)
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('joinQuiz', id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('quizUserCount', (data: { quizId: string; count: number }) => {
            if (String(data.quizId) === id) {
                setActiveUsers(Math.max(0, data.count));
            }
        });

        // Cleanup: leave quiz room and disconnect
        return () => {
            socket.emit('leaveQuiz', id);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [quizId]);

    return { activeUsers, isConnected };
}
