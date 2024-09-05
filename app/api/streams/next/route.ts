import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


const playNextSchema = z.object({
    streamId: z.string().uuid(),
    txSig: z.string(),
})

export async function GET() {
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
   console.log("before first call");

   const mostUpvotedStream = await prismaClient.stream.findFirst({
        where: {
            userId: user.id,
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
            userId: user.id
        },
        update: {
            userId: user.id,
            streamId: mostUpvotedStream?.id 
        },
        create: {
            userId: user.id,
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


export async function POST(req:NextRequest){

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

    const data = await req.json();
   
    //TODO : CREATE A ZOD SCHEMA

    const streamId = data.streamId as string;   
    // const tx = data.tx as string;

    //TODO: VERIFY THE TX SIG

    /*
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const txResponse = await connection.getTransaction(txnId,{ maxSupportedTransactionVersion: 0 });
    */  


    const nextStream = await prismaClient.stream.findUnique({
        where:{
            id:streamId,
            userId:user.id,
        }
    })

    if (!nextStream) {
        return NextResponse.json({
            message: "Enter Valid Stream Id !"
        }, {
            status: 404,
        })
    }
    

    await prismaClient.currentStream.delete({where:{userId:user.id}});

    await Promise.all([prismaClient.currentStream.upsert({
        where: {
            streamId : nextStream.id,
            userId:user.id
        },
        update: {
            streamId : nextStream.id,
        },
        create: {
            userId: user.id,
            streamId : nextStream.id,
        },
    }),prismaClient.stream.update({
        where: {
            id : nextStream.id,
        },
        data: {
            played: true,
            playedTs: new Date()
        }
   })])

   return NextResponse.json({
    stream: nextStream
   })
}