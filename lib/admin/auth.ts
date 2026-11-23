
import { cookies } from "next/headers";
import { pool } from "@/lib/db/config";

export async function getAdminSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) {
        return null;
    }

    const result = await pool.query(
        `SELECT s.username, u.role
         FROM sessions s
         JOIN users u ON s.username = u.username
         WHERE s.session_id = $1
         AND s.expires_at > NOW()
         AND u.role = 'admin'
         LIMIT 1`,
        [sessionId]
    );

    return result.rows[0] ?? null;
}
