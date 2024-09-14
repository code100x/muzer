"use server"

import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";

export default async function createSpace(spaceName:string){
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !session.user?.id) {
            throw new Error("Unauthneticated Request")
          }
          console.log(session.user.id)
        const space=await prisma.space.create({
            data:{
                name:spaceName,
                hostId:session.user.id as string
            }
        })
        return { success: true, message: "Space created successfully", space };
    } catch (error:any) {
        if (error.message === "Unauthenticated Request") {
            return { success: false, message: "You must be logged in to create a space" };
          }
        else{
            return { success: false, message: "An unexpected error occurred"+ error.message };
        }
    }
}