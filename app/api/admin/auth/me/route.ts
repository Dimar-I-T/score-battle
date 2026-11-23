import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";

export async function GET() {
    const admin = await getAdminSession();

    if (!admin) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        data: admin
    });
}