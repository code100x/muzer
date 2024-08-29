import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }

    try {
        await prismaClient.stream.updateMany({
            where: {
                userId: user.id,
                played: false
            },
            data: {
                played: true,
                playedTs: new Date()
            }
        });

        return NextResponse.json({
            message: "Queue emptied successfully"
        });
    } catch (error) {
        console.error("Error emptying queue:", error);
        return NextResponse.json({
            message: "Error while emptying the queue"
        }, {
            status: 500
        });
    }
}