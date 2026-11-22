import { pool } from '@/lib/db/config';

export async function setScoreService(username: string, score: number) {
    const text = `
        update users 
        set score = $1
        where username = $2
        returning username, score
    `;

    const result = await pool.query(text, [score, username]);
    return result.rows;
}