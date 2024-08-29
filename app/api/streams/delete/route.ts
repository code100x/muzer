"use server"
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function DELETE(req: NextRequest){
    try{
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
            })
        }
        const data = await req.json();
        console.log(data);

        const extractedId = data.url.split("?v=")[1];
        
        console.log(extractedId);

        const videoData = await prismaClient.stream.findFirst({
            where: {
                extractedId: extractedId
            }
        })
        await prismaClient.stream.delete({
            where: {
                id: videoData?.id
            }
        });
        // console.log(videoData);
        return NextResponse.json({
            message: "Deleted"
        }, {
            status: 200
        })
    }
    catch(e){
        return NextResponse.json({
            message: "Error"
        }, {
            status: 500
        })
    }
}