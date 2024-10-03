import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req:NextRequest)=>{

    try{
        const session = await getServerSession(authOptions);
        if (!session?.user.id) {
            return NextResponse.json(
                {
                    message: "Unauthenticated",
                },
                {
                    status: 403,
                },
            );
        }
        const data = await req.json();
        if(!data.spaceId || (typeof data.spaceId)!=="string"){
            return NextResponse.json(
                {
                    message: "Space Id is required",
                },
                {
                    status: 403,
                },
            );
        }
        // check if space exists
        const space = await prisma.space.findUnique({
            where: { id: data.spaceId },
        });
        if (!space) {
            return NextResponse.json(
                {
                    message: "Space not found",
                },
                {
                    status: 403,
                },
            );
        }
        // check if users creds are available
        const remainingCreds = await prisma.remainingCreds.findFirst({
            where: { 
                userId: session.user.id,
                spaceId: data.spaceId,
            },
            select: { remainingCreds: true },
        });

        if(!remainingCreds){
            return NextResponse.json(
                {
                    message: "No Credits available",
                    ok:false,
                }
            )
        }

        return NextResponse.json(
            {
                message: "Credits available",
                ok:true,
            }
        )
    }
    catch(error:any){
        if (error.message === "Unauthenticated Request") {
            return NextResponse.json(
                { success: false, message: "You must be logged in to create a space" },
                { status: 401 }
            );
        }

        
        return NextResponse.json(
            { success: false, message: `An unexpected error occurred: ${error.message}` },
            { status: 500 }
        );
    }

}
