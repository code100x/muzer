
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Providers } from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Muzer",
  description: "Discover the ultimate music experience with Muzer, where you can seamlessly add your favorite songs to the queue and decide what plays next.",
  keywords:"Muzer, music queue, song playlist, add songs to queue, music streaming, personalized playlists, DJ app, trending music, party playlist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
          <Providers>
            {children}
          </Providers>
        </body>
    </html>
  );
}
