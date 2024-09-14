"use server"

import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";


export const getSpaces=async()=>{
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !session.user?.id) {
            throw new Error("Unauthneticated Request")
          }
        const spaces=await prisma.space.findMany({
            where:{
                hostId:session.user.id
            }
        })
        return { success: true, message: "Spaces retrieved successfully", spaces };
    } catch (error:any) {
        if (error.message === "Unauthenticated Request") {
            console.error(error)
            return { success: false, message: "You must be logged get  a space" };
          }
        else{
            console.error(error)
            return { success: false, message: "Error fetching spaces"};
        }
        
    }
}