"use client";
import StreamView from "@/app/components/StreamView";
import useRedirect from "@/app/hooks/useRedirect";
import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Creator({
  params: { creatorId },
}: {
  params: {
    creatorId: string;
  };
}) {
  const { sendMessage, user } = useSocket();
  const session = useSession();
  useRedirect();

  useEffect(() => {
    if (user) {
      sendMessage("join-room", {
        creatorId,
        userId: user.id,
      });
    }
  }, [user]);

  if (!session.data) {
    return <h1>Please Log in....</h1>;
  }
  return <StreamView creatorId={creatorId} playVideo={false} />;
}

export const dynamic = "auto";
