import GoogleProvider from "next-auth/providers/google";
import NextAuth, {type DefaultSession } from "next-auth"
import { prismaClient } from "@/app/lib/db";
import { authOptions } from "@/app/lib/authOptions";

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }