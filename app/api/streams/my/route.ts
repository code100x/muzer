import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();

    // session contains user information or not
    if (!session || !session.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        });
    }

    // get all streams associated with the user by their email
    const streams = await prismaClient.stream.findMany({
        where: {
            user: {
                email: session.user.email
            }
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    user: {
                        email: session.user.email
                    }
                }
            }
        }
    });

    return NextResponse.json({
        streams: streams.map(({ _count, ...rest }) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length > 0
        }))
    });
}
