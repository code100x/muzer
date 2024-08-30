import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const { creatorId } = await req.json();

    if (user.id !== creatorId) {
        return NextResponse.json({
            message: "Unauthorized"
        }, {
            status: 403
        });
    }

    try {
        const streams = await prismaClient.stream.findMany({
            where: {
                userId: creatorId,
                played: false
            }
        });

        const shuffledStreams = streams.sort(() => Math.random() - 0.5);

        await Promise.all(shuffledStreams.map((stream, index) => 
            prismaClient.stream.update({
                where: { id: stream.id },
                data: { order: index }
            })
        ));

        return NextResponse.json({
            message: "Queue shuffled successfully"
        });
    } catch (error) {
        console.error("Error shuffling queue:", error);
        return NextResponse.json({
            message: "Error while shuffling the queue"
        }, {
            status: 500
        });
    }
}