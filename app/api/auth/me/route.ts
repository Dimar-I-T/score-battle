import { getAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserData } from "@/services/authService";

export async function GET() {
    try {
        const user = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const result = await getUserData(user.username);
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved user data",
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 });
    }
}