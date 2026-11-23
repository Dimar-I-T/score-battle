
import { NextRequest, NextResponse } from "next/server";
import { adminLoginService } from "@/services/authService";
import { createSession } from "@/lib/vulnerable/session";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        const payload = await adminLoginService({
            username,
            password
        });

        const sessionId = await createSession(username);

        const response = NextResponse.json({
            success: true,
            message: "Successfully logged in",
            data: payload
        });

        response.cookies.set("session_id", sessionId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24
        });

        return response;

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, {
            status: 401
        });
    }
}
