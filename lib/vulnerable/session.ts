import { pool } from '@/lib/db/config';

export async function createSession(username: string) {
    const result = await pool.query(
        `WITH next AS (
            SELECT nextval(
                pg_get_serial_sequence('sessions', 'id')
            ) AS id
         )
         INSERT INTO sessions (id, session_id, username, expires_at)
         SELECT
            id,
            (id + 1000)::TEXT,
            $1,
            NOW() + INTERVAL '1 day'
         FROM next
         RETURNING session_id`,
        [username]
    );

    return result.rows[0].session_id;
}