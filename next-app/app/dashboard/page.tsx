"use client";
import { useEffect } from "react";
import StreamView from "../components/StreamView";
import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import useRedirect from "../hooks/useRedirect";
import jwt from "jsonwebtoken";

export default function Component() {
  const { socket, user } = useSocket();
  const session = useSession();
  useRedirect();

  useEffect(() => {
    if (user) {
      const token = jwt.sign(
        {
          creatorId: user.id,
          userId: user.id,
        },
        process.env.NEXT_PUBLIC_SECRET || "",
        {
          expiresIn: "24h",
        }
      );

      socket?.send(
        JSON.stringify({
          type: "join-room",
          data: {
            token,
          },
        })
      );
    }
  }, [user]);

  if (!session.data) {
    return <h1>Please Log in....</h1>;
  }

  return <StreamView creatorId={session.data.user.id} playVideo={true} />;
}

export const dynamic = "auto";
