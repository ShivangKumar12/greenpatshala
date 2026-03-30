// client/src/components/quiz/LiveStatusBadge.tsx — Admin live/offline quiz status badge
import { Radio } from 'lucide-react';

interface LiveStatusBadgeProps {
    activeUsers: number;
    isConnected: boolean;
}

/**
 * Shows whether a quiz is currently being attempted by users.
 * - LIVE (green pulse) + user count  when activeUsers > 0 and connected
 */
export default function LiveStatusBadge({ activeUsers, isConnected }: LiveStatusBadgeProps) {
    // Only show when quiz is actually live (users attempting)
    if (!isConnected || activeUsers <= 0) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
            {/* Pulsing green dot */}
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                LIVE
            </span>
            <span className="text-xs font-bold text-green-800 dark:text-green-200">
                {activeUsers.toLocaleString()} {activeUsers === 1 ? 'user' : 'users'}
            </span>
        </div>
    );
}
