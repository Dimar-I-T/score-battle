import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { setScoreService } from "@/services/scoreService";

export async function PUT(req: NextRequest) {
    try {
        const { score } = await req.json();
        const user = await getAuth();
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const result = await setScoreService(user.username, score);
        return NextResponse.json({
            success: true,
            message: "Successfully updated score",
            data: result
        }, { status: 201 });
    } catch (error: any) {
        let errorMessage: string = error.message;
        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}