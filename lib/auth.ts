import { JWTPayload } from "@/app/types/types";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { pool } from '@/lib/db/config';

export async function getAuth(): Promise<JWTPayload | null> {
    const cookie = await cookies();
    const token = cookie.get('token')?.value;

    if (!token) {
        throw Error('Unauthorized! You must login');
    }

    try {
        const payload = decodeJwt(token);

        console.log(JSON.stringify(payload));

        await pool.query(
            `update users
            set last_seen_at = now()
            where username = $1 and (last_seen_at is null or last_seen_at < now() - interval '1 minute')`,
            [payload.username]
        );

        return payload as unknown as JWTPayload;
    } catch (error: any) {
        console.log(error);
        return null;
    }
}