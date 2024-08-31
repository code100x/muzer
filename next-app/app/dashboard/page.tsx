"use client";
import { useEffect } from "react";
import StreamView from "../components/StreamView";
import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import useRedirect from "../hooks/useRedirect";

export default function Component() {
  const { sendMessage, user } = useSocket();
  const session = useSession();
  useRedirect();

  useEffect(() => {
    if (user) {
      sendMessage("join-room", {
        creatorId: user.id,
        userId: user.id,
      });
    }
  }, [user]);

  if (!session.data) {
    return <h1>Please Log in....</h1>;
  }

  return <StreamView creatorId={session.data.user.id} playVideo={true} />;
}

export const dynamic = "auto";
