"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import useRedirect from "../../hooks/useRedirect";
import jwt from "jsonwebtoken";
import StreamView from "../../components/StreamView";

export default function Component() {
  const { socket, user } = useSocket();
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
        },
      );

      socket?.send(
        JSON.stringify({
          type: "join-room",
          data: {
            token,
          },
        }),
      );
    }
  }, [user]);

  if (!user) {
    return <h1>Please Log in....</h1>;
  }

  return <StreamView creatorId={user.id} playVideo={true} />;
}

export const dynamic = "auto";
