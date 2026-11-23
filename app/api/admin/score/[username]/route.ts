import { getAdminSession } from "@/lib/admin/auth";
import { setScoreService } from "@/services/scoreService";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
    params: Promise<{
        username: string;
    }>;
}


export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        const { username } = await params;
        const { score } = await req.json();
        const admin = await getAdminSession();

        if (!admin) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const result = await setScoreService(username, score);
        return NextResponse.json({
            success: true,
            message: "Successfully updated user's score",
            data: result
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 500 })
    }
}