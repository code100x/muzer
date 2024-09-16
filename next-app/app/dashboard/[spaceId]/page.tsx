"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import jwt from "jsonwebtoken";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import useRedirect from "@/hooks/useRedirect";
import StreamView from "@/components/StreamView";

export default function Component({
    params: { spaceId },
}:{
    params:{spaceId:string}
}) {
  const { socket, user, loading, setUser, connectionError } = useSocket();
  useRedirect();

  useEffect(() => {
    if (user && !user.token) {
      const token = jwt.sign(
        {
          creatorId: user?.id,
          userId: user?.id,
          spaceId: spaceId,
        },
        process.env.NEXT_PUBLIC_SECRET || "",
        {
          expiresIn: "24h",
        }
      );
      console.log("spaceId", spaceId);
      socket?.send(
        JSON.stringify({
          type: "join-room",
          data: {
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

  return <StreamView creatorId={user.id} spaceId={spaceId} playVideo={true} />;
}

export const dynamic = "auto";
