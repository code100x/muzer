"use server"

import { authOptions } from "@/lib/auth-options";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";


export const deleteSpaces=async(spaceId:string)=>{
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !session.user?.id) {
            throw new Error("Unauthneticated Request")
          }
        const spaces=await prisma.space.delete({
            where:{
                id:spaceId
            }
        })
        return { success: true, message: "Spaces Deleted successfully", spaces };
    } catch (error:any) {
        if (error.message === "Unauthenticated Request") {
            console.error(error)
            return { success: false, message: "You must be logged  to delete  a space" };
          }
        else{
            console.error(error)
            return { success: false, message: "Error Deleting spaces"};
        }
        
    }
}