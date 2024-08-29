import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// The UpvoteSchema holds both streamId and userId
const UpvoteSchema = z.object({
    streamId: z.string(),
    userId: z.string()
})

// req has - "streamId" & "userId"
export async function POST(req: NextRequest) {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    try {
        const data = UpvoteSchema.parse(await req.json()); // data contains both streamId and userId
        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    userId: data.userId,
                    streamId: data.streamId
                }
            }
        });

        return NextResponse.json({
            message: "Done!"
        })
    } catch(e) {
        return NextResponse.json({
            message: "Error while upvoting"
        }, {
            status: 403
        })
    }

}