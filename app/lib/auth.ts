import GoogleProvider from "next-auth/providers/google";
import NextAuth, { AuthOptions } from "next-auth";
import { prismaClient } from "@/app/lib/db";

export const AuthConfig: AuthOptions = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }

      try {
        await prismaClient.user.create({
          data: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (e) {}
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const dbUser = await prismaClient.user.findUnique({
          where: {
            email: user.email,
          },
        });
        if (!dbUser) return token;
        token.id = dbUser.id;
        return token;
      }

      return token;
    },
    async session({ session, token, user }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
