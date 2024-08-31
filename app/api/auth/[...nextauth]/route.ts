import GoogleProvider from "next-auth/providers/google";
import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { prismaClient } from "@/app/lib/db";
//@ts-ignore
import bcrypt from 'bcrypt';

type Provider = "Google" | "Credentials";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            provider: Provider;
            username: string;
        } & DefaultSession["user"]
    }
}

// Function to generate unique username
async function generateUniqueUsername(email: string) {
    const baseUsername = email.split('@')[0];
    let username = baseUsername;
    let counter = 1;

    // Check if the username already exists
    while (await prismaClient.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
    }
    return username;
}

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text', placeholder: 'Email' },
                password: { label: 'Password', type: 'password', placeholder: 'Password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.error('Invalid credentials provided');
                    return null;
                }
                try {
                    let user = await prismaClient.user.findUnique({
                        where: {
                            email: credentials.email,
                        }
                    });

                    if (user) {
						const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
						if (!isPasswordValid) {
							console.error('Invalid password for user: ', credentials.email);
							return null;
						}
					} else {
						const username = await generateUniqueUsername(credentials.email);
						const hashedPassword = await bcrypt.hash(credentials.password, 10);
						user = await prismaClient.user.create({
							data: {
								email: credentials.email,
								password: hashedPassword,
								provider: "Credentials",
								username: username
							}
						});
						console.log('New user created: ', user.email);
					}

                    return {
                        id: user.id,
                        email: user.email,
                        provider: user.provider as Provider,
                        username: user.username,
                    };
                } catch(e) {
                    console.error('Error in authorize function:', e);
                    return null;
                }
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) {
                console.error('No email provided for user');
                return false;
            }

            if (account?.provider === "Google") {
                try {
                    const existingUser = await prismaClient.user.findUnique({
                        where: {
                            email: user.email
                        }
                    });
                    if (!existingUser) {
                        const username = await generateUniqueUsername(user.email);
                        await prismaClient.user.create({
                            data: {
                                email: user.email,
                                provider: "Google",
                                username: username
                            } 
                        });
                        console.log('New Google user created:', user.email);
                    }
                    return true;
                } catch(e) {
                    console.error('Error in Google signIn:', e);
                    return false;
                }
            }

            return true;
        },
        async session({ session, token }) {
            if (token && token.sub) {
                session.user.id = token.sub;
            }
            if (session.user && token && token.sub) {
                session.user.id = token.sub;
                session.user.provider = (token.provider as Provider) ?? "Credentials";
                session.user.username = token.username as string;
            }
            return session;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.provider = (user as any).provider || account?.provider;
                token.username = (user as any).username;
				token.sub = user.id;
            }
            return token;
        }
    },
})

export { handler as GET, handler as POST }