import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await getServerSession();

    if (!session?.user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }
    return NextResponse.json(session.user);
};

// dont static render
export const dynamic = 'force-dynamic';
