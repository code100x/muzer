import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    // TODO: You can get rid of the db call here 
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
       })
   }

   const spaceId = req.nextUrl.searchParams.get("spaceId");
   const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: user.id,
            played: false,
            spaceId:spaceId
        },
        orderBy: {
            upvotes: {
                _count: 'desc'
            }
        }
   });
   await Promise.all([prismaClient.currentStream.upsert({
        where: {
            userId: user.id,
            spaceId:spaceId as string
            
        },
        update: {
            userId: user.id,
            streamId: mostUpvotedStream?.id ,
            spaceId:spaceId
        },
        create: {
            userId: user.id,
            streamId: mostUpvotedStream?.id,
            spaceId:spaceId 
        }
    }), prismaClient.stream.update({
        where: {
            id: mostUpvotedStream?.id ?? ""
        },
        data: {
            played: true,
            playedTs: new Date()
        }
   })])

   return NextResponse.json({
    stream: mostUpvotedStream
   })
   
}