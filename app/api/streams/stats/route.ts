// New file: app/api/streams/stats/route.ts
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    const session = await getServerSession();
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user || !creatorId) {
        return NextResponse.json({
            message: "Unauthorized or missing creatorId"
        }, {
            status: 403
        });
    }

    const streamStart = await prismaClient.stream.findFirst({
        where: {
            userId: creatorId,
            played: false
        },
        orderBy: {
            createAt: 'asc'
        }
    });

    const uniqueUsers = await prismaClient.stream.groupBy({
        by: ['userId'],
        where: {
            userId: creatorId,
            createAt: {
                gte: streamStart?.createAt
            }
        },
        _count: {
            userId: true
        }
    });

    const streamDuration = streamStart 
        ? Math.floor((Date.now() - streamStart.createAt.getTime()) / 1000) 
        : 0;

    return NextResponse.json({
        uniqueUsers: uniqueUsers.length,
        streamDuration: streamDuration
    });
}