import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
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
        const parsed = UpvoteSchema.safeParse(await req.json()); // data contains both streamId and userId

        if (!parsed.success) {
            return NextResponse.json({
                message: "Invalid data",
                errors: parsed.error.errors
            }, {
                status: 403
            })
        }


        await prismaClient.upvote.delete({
            where: {
                userId_streamId: {
                    streamId: `${parsed.data?.streamId}`,
                    userId: `${parsed.data?.userId}`
                }
            }
        });

        return NextResponse.json({
            message: "Done!"
        })
    } catch (e) {
        return NextResponse.json({
            message: "Error while upvoting",
            error: (e instanceof ZodError ? e.errors : (e as Error).message)
        }, {
            status: 500 // Internal Server Error code
        })
    }

}