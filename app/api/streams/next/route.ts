import { authOption } from "@/app/lib/authOptions";
import  prismaClient  from "@/app/lib/db"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOption);
    // TODO: You can get rid of the db call here 
   if (!session?.user) {
       return NextResponse.json({
           message: "Unauthenticated"
       }, {
           status: 403
       })
   }
   console.log("before first call");

   const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: session.user.id,
            played: false
        },
        orderBy: {
            upvotes: {
                _count: 'desc'
            }
        }
   });
   console.log("after first call");
   console.log(mostUpvotedStream?.id )
 
   await Promise.all([prismaClient.currentStream.upsert({
        where: {
            userId: session.user.id
        },
        update: {
            userId: session.user.id,
            streamId: mostUpvotedStream?.id 
        },
        create: {
            userId: session.user.id,
            streamId: mostUpvotedStream?.id
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