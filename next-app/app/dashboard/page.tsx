"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import useRedirect from "../../hooks/useRedirect";
import jwt from "jsonwebtoken";
import StreamView from "../../components/StreamView";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Component() {
  const { socket, user, loading, setUser, connectionError } = useSocket();
  useRedirect();

  useEffect(() => {
    if (user && !user.token) {
      const token = jwt.sign(
        {
          creatorId: user?.id,
          userId: user?.id,
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

  return <StreamView creatorId={user.id} playVideo={true} />;
}

export const dynamic = "auto";
