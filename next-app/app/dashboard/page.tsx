"use client";
import { useEffect } from "react";
import StreamView from "../components/StreamView";
import { useSocket } from "@/context/socket-context";

export default function Component() {
  const { user, sendMessage } = useSocket();

  useEffect(() => {
    if (user) {
      sendMessage("create-room", {
        creatorId: user.id,
      });
      sendMessage("join-room", {
        creatorId: user.id,
        userId: user.id,
      });
    }
  }, [user]);

  if (!user) {
    return <h1>Please Log in....</h1>;
  }

  return <StreamView creatorId={user.id} playVideo={true} />;
}

export const dynamic = "auto";
