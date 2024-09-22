import { NextAuthOptions, Session } from "next-auth";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { emailSchema, passwordSchema } from "@/schema/credentials-schema";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import prisma from "@/lib/db";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const emailValidation = emailSchema.safeParse(credentials.email);

        if (!emailValidation.success) {
          throw new Error("Invalid email");
        }

        const passwordValidation = passwordSchema.safeParse(credentials.password);

        if (!passwordValidation.success) {
          throw new Error(passwordValidation.error.issues[0].message);
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: emailValidation.data
            }
          });

          if (!user) {
            const hashedPassword = await bcrypt.hash(passwordValidation.data, 10);

            const newUser = await prisma.user.create({
              data: {
                email: emailValidation.data,
                password: hashedPassword,
                provider: "Credentials"
              }
            });

            return newUser;
          }

          if (!user.password) {
            const hashedPassword = await bcrypt.hash(passwordValidation.data, 10);

            const authUser = await prisma.user.update({
              where: {
                email: emailValidation.data
              },
              data: {
                password: hashedPassword
              }
            });
            return authUser;
          }

          const passwordVerification = await bcrypt.compare(passwordValidation.data, user.password);

          if (!passwordVerification) {
            throw new Error("Invalid password");
          }

          return user;
        } catch (error) {
          if (error instanceof PrismaClientInitializationError) {
            throw new Error("Internal server error");
          }
          console.log(error);
          throw error;
        }

      },
    })
  ],
  pages: {
    signIn: "/auth"
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email as string;
        token.id = account.access_token;
      }
      return token;
    },
    async session({ session, token }: {
      session: Session,
      token: JWT;
    }) {
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: token.email
          }
        });

        if (user) {
          session.user.id = user.id;
        }
      } catch (error) {
        if (error instanceof PrismaClientInitializationError) {
          throw new Error("Internal server error");
        }
        console.log(error);
        throw error;
      }
      return session;
    },
    async signIn({ account, profile }) {

      try {
        if (account?.provider === "google") {

          const user = await prisma.user.findUnique({
            where: {
              email: profile?.email!,
            }
          });


          if (!user) {
            const newUser = await prisma.user.create({
              data: {
                email: profile?.email!,
                name: profile?.name || undefined,
                provider: "Google"
              }
            });
          }
        }
        return true;
      } catch (error) {
        console.log(error);
        //throw error;
        return false;
      }
    }
  }
} satisfies NextAuthOptions;