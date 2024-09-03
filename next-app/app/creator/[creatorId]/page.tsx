"use client";
import StreamView from "@/app/components/StreamView";
import useRedirect from "@/app/hooks/useRedirect";
import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import jwt from "jsonwebtoken";

export default function Creator({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {
  const { socket, user } = useSocket();
  const session = useSession();
  useRedirect();

  useEffect(() => {
    if (user) {
      const token = jwt.sign(
        {
          creatorId: creatorId,
          userId: user.id,
        },
        process.env.NEXT_PUBLIC_SECRET ?? "secret"
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
  return <StreamView creatorId={creatorId} playVideo={false} />;
}

export const dynamic = "auto";
