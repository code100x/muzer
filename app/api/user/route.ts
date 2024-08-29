import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await getServerSession();
    // TODO: You can get rid of the db call here 

    if (!session) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }
    const user = session.user;

    return NextResponse.json({
        user
    });
}

// dont static render
export const dynamic = 'force-dynamic'
