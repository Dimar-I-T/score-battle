import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/services/leaderboardService";

export async function GET() {
    try {
        const result = await getLeaderboard();
        return NextResponse.json({
            success: true,
            message: "Successfully retrieved leaderboard",
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