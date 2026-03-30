// server/config/socketHandler.ts — Socket.io quiz room & active-user counter
import { Server as IOServer, Socket } from 'socket.io';
import { redis, isRedisAvailable } from './redis';

const QUIZ_KEY = (quizId: string) => `quiz_active:${quizId}`;

// Track which quizzes each socket has joined AS A PARTICIPANT (for cleanup on disconnect)
const socketQuizMap = new Map<string, Set<string>>();
// Track which quizzes each socket is OBSERVING (admin — no counter impact)
const socketObserveMap = new Map<string, Set<string>>();

/**
 * Registers all Socket.io event handlers on the given IO server.
 */
export function registerSocketHandlers(io: IOServer) {
    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socketQuizMap.set(socket.id, new Set());
        socketObserveMap.set(socket.id, new Set());

        // ─── JOIN QUIZ (user attempting — INCREMENTS counter) ──
        socket.on('joinQuiz', async (quizId: string) => {
            if (!quizId || typeof quizId !== 'string') return;

            const quizzes = socketQuizMap.get(socket.id);
            if (!quizzes || quizzes.has(quizId)) return; // already joined

            socket.join(quizId);
            quizzes.add(quizId);

            if (isRedisAvailable()) {
                try {
                    const count = await redis.incr(QUIZ_KEY(quizId));
                    io.to(quizId).emit('quizUserCount', { quizId, count });
                } catch (err) {
                    console.warn('Redis INCR error:', (err as Error).message);
                }
            }
        });

        // ─── LEAVE QUIZ (user done — DECREMENTS counter) ──────
        socket.on('leaveQuiz', async (quizId: string) => {
            await handleLeave(socket, quizId, io);
        });

        // ─── OBSERVE QUIZ (admin — joins room but NO counter change) ──
        socket.on('observeQuiz', async (quizId: string) => {
            if (!quizId || typeof quizId !== 'string') return;

            const observed = socketObserveMap.get(socket.id);
            if (!observed || observed.has(quizId)) return; // already observing

            socket.join(quizId);
            observed.add(quizId);

            // Send current count to the observer without modifying it
            if (isRedisAvailable()) {
                try {
                    const raw = await redis.get(QUIZ_KEY(quizId));
                    const count = Math.max(0, parseInt(raw || '0', 10));
                    socket.emit('quizUserCount', { quizId, count });
                } catch (err) {
                    console.warn('Redis GET error:', (err as Error).message);
                }
            } else {
                socket.emit('quizUserCount', { quizId, count: 0 });
            }
        });

        // ─── UNOBSERVE QUIZ (admin leaves room — NO counter change) ──
        socket.on('unobserveQuiz', (quizId: string) => {
            if (!quizId || typeof quizId !== 'string') return;

            const observed = socketObserveMap.get(socket.id);
            if (!observed || !observed.has(quizId)) return;

            socket.leave(quizId);
            observed.delete(quizId);
        });

        // ─── DISCONNECT ─────────────────────────────────────
        socket.on('disconnect', async () => {
            // Clean up participant joins (decrement counters)
            const quizzes = socketQuizMap.get(socket.id);
            if (quizzes) {
                const quizIds = Array.from(quizzes);
                for (const quizId of quizIds) {
                    await handleLeave(socket, quizId, io);
                }
                socketQuizMap.delete(socket.id);
            }
            // Clean up observer rooms (no counter changes needed)
            socketObserveMap.delete(socket.id);
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
}

async function handleLeave(socket: Socket, quizId: string, io: IOServer) {
    if (!quizId || typeof quizId !== 'string') return;

    const quizzes = socketQuizMap.get(socket.id);
    if (!quizzes || !quizzes.has(quizId)) return; // not in this room

    socket.leave(quizId);
    quizzes.delete(quizId);

    if (isRedisAvailable()) {
        try {
            const count = await redis.decr(QUIZ_KEY(quizId));
            // Prevent negative counters
            const safeCount = Math.max(0, count);
            if (count < 0) {
                await redis.set(QUIZ_KEY(quizId), '0');
            }
            io.to(quizId).emit('quizUserCount', { quizId, count: safeCount });
        } catch (err) {
            console.warn('Redis DECR error:', (err as Error).message);
        }
    }
}
