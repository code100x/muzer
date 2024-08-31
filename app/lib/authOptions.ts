import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import  prismaClient  from "./db";

export const authOption:NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    callbacks: {
        async signIn(params) {
            if (!params.user.email) {
                return false;
            }

            try {
                let user = await prismaClient.user.findUnique({
                    where:{
                        email:params.user.email,
                    },
                });
                if(!user){
                    user = await prismaClient.user.create({
                        data:{
                            email:params.user.email,
                            provider:"Google"
                        }
                    })
                };
                params.user.id = user.id
             } catch(e) {
                return false;
             }
            return true;
        },
        jwt({token,session,user}){
           if(user){
                token.id = user.id;
                token.name = user.name
                token.email = user.email
           };
           return token;
        },
        session({session,token}){
            if(token && session && session.user){
                session.user.id = token.id;
                session.user.email = token.email
            };
            return session
        }
        
    }
}