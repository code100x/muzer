"use client";
import StreamView from "@/app/components/StreamView";
import { useSocket } from "@/context/socket-context";
import { useEffect } from "react";

export default function Creator({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {
  const { user, sendMessage } = useSocket();

  useEffect(() => {
    if (user) {
      sendMessage("join-room", {
        creatorId,
        userId: user.id,
      });
    }
  }, [user]);

  if (!user) {
    return null;
  }
  return <StreamView creatorId={creatorId} playVideo={false} />;
}

export const dynamic = "auto";
