// client/src/components/quiz/ActiveUsersCounter.tsx — 🔥 Live quiz user counter
import { Flame, Users, Wifi, WifiOff } from 'lucide-react';

interface ActiveUsersCounterProps {
    activeUsers: number;
    isConnected: boolean;
    /** Compact mode for header bars */
    compact?: boolean;
}

/**
 * Displays a real-time count of how many users are currently
 * attempting this quiz.
 *
 * Example:  🔥 128 users currently attempting this quiz
 */
export default function ActiveUsersCounter({
    activeUsers,
    isConnected,
    compact = false,
}: ActiveUsersCounterProps) {
    // Don't render when count is 0 or disconnected
    if (!isConnected || activeUsers <= 0) return null;

    /* ── Compact Mode (header/sticky bar) ─────────────────────── */
    if (compact) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-semibold animate-pulse-slow select-none">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>{activeUsers.toLocaleString()}</span>
                <Users className="w-3 h-3 shrink-0 opacity-70" />
            </div>
        );
    }

    /* ── Full Mode (quiz start screen) ────────────────────────── */
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 select-none">
            <div className="relative">
                <Flame className="w-6 h-6 text-orange-500 animate-bounce-slow" />
                {/* pulse ring */}
                <span className="absolute inset-0 rounded-full animate-ping bg-orange-400/30" />
            </div>

            <div className="flex flex-col">
                <span className="text-sm font-bold text-orange-700 dark:text-orange-300 leading-tight">
                    {activeUsers.toLocaleString()} {activeUsers === 1 ? 'user' : 'users'}
                </span>
                <span className="text-xs text-orange-600/70 dark:text-orange-400/70 leading-tight">
                    currently attempting this quiz
                </span>
            </div>

            {/* connection indicator */}
            <div className="ml-auto" title={isConnected ? 'Live' : 'Reconnecting…'}>
                {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                    <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
                )}
            </div>
        </div>
    );
}
