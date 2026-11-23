import { JWTPayload } from "@/app/types/types";
import jwt, {
    type Secret,
    type JwtPayload as JsonWebTokenPayload,
} from 'jsonwebtoken';
import { pool } from '@/lib/db/config';
import { headers, cookies } from 'next/headers';

export async function getAuth(): Promise<JWTPayload | null> {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    const cookieStore = await cookies();

    const token = bearerToken ?? cookieStore.get('token')?.value;

    if (!token) {
        throw Error('Unauthorized! You must login');
    }

    try {
        const payload = jwt.verify(
            token,
            undefined as unknown as Secret,
            {
                algorithms: ["none"],
            }
        ) as JsonWebTokenPayload;

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