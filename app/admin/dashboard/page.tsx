'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useAdminSession';

interface LeaderboardUser {
    username: string;
    score: number;
    is_online: boolean;
}

export default function AdminPage() {
    const router = useRouter();

    const { admin, isLoading: isCheckingSession } = useAdminSession();

    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [scoreEdits, setScoreEdits] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [savingUser, setSavingUser] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (isCheckingSession) return;

        if (!admin) {
            router.replace('/admin/auth/login');
            return;
        }

        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/leaderboard', {
                    cache: 'no-store',
                });

                const result = await res.json();

                if (!res.ok || !result.success) {
                    throw new Error(result.message || 'Failed to fetch leaderboard');
                }

                setUsers(result.data);

                const initialScores: Record<string, string> = {};

                result.data.forEach((user: LeaderboardUser) => {
                    initialScores[user.username] = String(user.score);
                });

                setScoreEdits(initialScores);
            } catch (err) {
                setError("There's an error retrieving the leaderboard.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [admin, isCheckingSession, router]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);

            const res = await fetch('/api/admin/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Failed to logout');
            }

            router.replace('/admin/auth/login');
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to logout'
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleScoreChange = (username: string, value: string) => {
        setScoreEdits((prev) => ({
            ...prev,
            [username]: value,
        }));

        setSuccess('');
    };

    const handleSaveScore = async (username: string) => {
        const newScore = Number(scoreEdits[username]);

        if (
            scoreEdits[username].trim() === '' ||
            !Number.isInteger(newScore) ||
            newScore < 0
        ) {
            setError('Score must be a non-negative integer.');
            return;
        }

        try {
            setSavingUser(username);
            setError('');
            setSuccess('');

            const res = await fetch(
                `/api/admin/score/${encodeURIComponent(username)}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        score: newScore,
                    }),
                }
            );

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Failed to update score');
            }

            setUsers((prev) =>
                prev.map((user) =>
                    user.username === username
                        ? { ...user, score: newScore }
                        : user
                )
            );

            setSuccess(`Successfully updated ${username}'s score.`);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to update score.'
            );
        } finally {
            setSavingUser(null);
        }
    };

    if (isCheckingSession || (admin && isLoading)) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-lighter_black p-4">
                <p className="text-gray-400">Loading admin dashboard...</p>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-lighter_black p-4">
                <p className="text-gray-400">Redirecting to admin login...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-lighter_black p-4">
            <div className="flex flex-col gap-5 bg-black rounded-xl w-full max-w-[550px] p-6 md:p-8">

                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-bold text-purple">
                        Admin Dashboard
                    </h1>

                    <p className="text-sm text-gray-400">
                        Manage Score Battle Players
                    </p>

                    <p className="text-xs text-gray-500">
                        Logged in as {admin.username}
                    </p>
                </div>

                <div className="flex flex-col gap-3">

                    {error && (
                        <p className="text-center text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-center text-sm text-green-500">
                            {success}
                        </p>
                    )}

                    {users.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">
                            No players found.
                        </p>
                    ) : (
                        users.map((player) => {
                            const isChanged =
                                scoreEdits[player.username] !== String(player.score);

                            return (
                                <div
                                    key={player.username}
                                    className="flex items-center justify-between gap-3 p-4 rounded-lg border border-purple bg-zinc-900"
                                >
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-white truncate">
                                            {player.username}
                                        </span>

                                        <span className="text-xs text-gray-400">
                                            {player.is_online ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={scoreEdits[player.username] ?? ''}
                                            onChange={(e) =>
                                                handleScoreChange(player.username, e.target.value)
                                            }
                                            className="w-20 bg-black border border-zinc-700 focus:border-purple rounded-lg px-2 py-2 text-center text-purple font-bold outline-none"
                                        />

                                        <button
                                            onClick={() => handleSaveScore(player.username)}
                                            disabled={!isChanged || savingUser === player.username}
                                            className="bg-purple text-black px-3 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {savingUser === player.username ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full  text-white bg-red-800 py-2.5 rounded-lg font-bold"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </div>
        </div>
    );
}