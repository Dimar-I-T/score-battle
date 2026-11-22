import { pool } from '@/lib/db/config';

export async function getLeaderboard() {
    const text = `
        select username, score, (last_seen_at >= NOW() - INTERVAL '5 MINUTE') AS is_online
        from users
        order by score desc
    `;

    const result = await pool.query(text);
    return result.rows;
}