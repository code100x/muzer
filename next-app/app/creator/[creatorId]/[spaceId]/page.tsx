"use client";
import StreamView from "@/components/StreamView";
import useRedirect from "@/hooks/useRedirect";
import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import jwt from "jsonwebtoken";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Creator({
  params: { creatorId , spaceId },

}: {
  params: {
    creatorId: string;
    spaceId: string;
  };
}) {
  const { socket, user, connectionError, loading, setUser } = useSocket();
  useRedirect();

  useEffect(() => {
    if (user && !user.token) {
      const token = jwt.sign(
        {
          creatorId: creatorId,
          userId: user.id,
          spaceId: spaceId,
        },
        process.env.NEXT_PUBLIC_SECRET ?? "secret"
      );

      socket?.send(
        JSON.stringify({
          type: "join-room",
          data: {
            spaceId,
            token,
          },
        })
      );

      setUser({ ...user, token });
    }
  }, [user]);

  if (connectionError) {
    return <ErrorScreen>Cannot connect to socket server</ErrorScreen>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <ErrorScreen>Please Log in....</ErrorScreen>;
  }

  return <StreamView creatorId={creatorId} spaceId={spaceId} playVideo={false} />;
}

export const dynamic = "auto";
