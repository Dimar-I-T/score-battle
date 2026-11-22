
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LeaderboardUser {
  username: string;
  score: number;
  is_online: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();

  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Failed to fetch leaderboard');
        }

        setUsers(result.data);
      } catch (err) {
        setError("There's an error retrieving the leaderboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankStyle = (index: number) => {
    return 'text-purple border-purple';
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-lighter_black p-4">

      <div className="flex flex-col gap-5 bg-black rounded-xl w-full max-w-[500px] p-6 md:p-8">

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold text-purple">
            Leaderboard
          </h1>

          <p className="text-sm text-gray-400">
            Score Battle Rankings
          </p>
        </div>

        <div className="flex flex-col gap-3">

          {isLoading ? (
            <p className="text-center text-gray-400 py-8">
              Loading leaderboard...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 py-8">
              {error}
            </p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              No players found.
            </p>
          ) : (
            users.map((player, index) => (
              <div
                key={player.username}
                className={`flex items-center justify-between gap-3 p-4 rounded-lg border ${getRankStyle(index)} bg-zinc-900`}
              >
                <div className="flex items-center gap-4 min-w-0">

                  <div className={`flex items-center justify-center w-9 h-9 shrink-0 rounded-full border-2 font-bold ${getRankStyle(index)}`}>
                    {index + 1}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white truncate">
                      {player.username}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">
                        {player.is_online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>

                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xl font-bold text-purple">
                    {player.score}
                  </span>
                </div>
              </div>
            ))
          )}

        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-2 w-full bg-pink_custom text-black py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>

      </div>
    </div>
  );
}
