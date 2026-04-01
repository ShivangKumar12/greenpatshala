// client/src/hooks/useQuizSocket.ts — Real-time quiz active-users counter via Socket.io
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Always connect to the same origin (Hostinger CDN / Nginx proxies /socket.io/ to Node)
const SOCKET_URL = window.location.origin;

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

        // Production-resilient socket connection
        const socket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,   // never give up during a quiz
            reconnectionDelay: 1000,          // start at 1s
            reconnectionDelayMax: 10000,      // cap at 10s (exponential backoff)
            randomizationFactor: 0.5,         // jitter to avoid thundering herd
            timeout: 20000,                   // connection timeout
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('joinQuiz', id);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('connect_error', () => {
            // Silently handle — socket.io will auto-reconnect
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
