import { authOption } from "@/app/lib/authOptions";
import  prismaClient  from "@/app/lib/db"
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOption);
     // TODO: You can get rid of the db call here 

    if (!session?.user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }

    
    const streams = await prismaClient.stream.findMany({
        where: {
            userId: session.user.id
        },
        include: {
            _count: {
                select: {
                    upvotes: true
                }
            },
            upvotes: {
                where: {
                    userId: session.user.id
                }
            }
        }
    })
    

    return NextResponse.json({
        streams: streams.map(({_count, ...rest}) => ({
            ...rest,
            upvotes: _count.upvotes,
            haveUpvoted: rest.upvotes.length ? true : false
        }))
    })
}