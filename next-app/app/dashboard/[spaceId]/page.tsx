"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import useRedirect from "../../../hooks/useRedirect";
import jwt from "jsonwebtoken";
import OldStreamView from "../../../components/OldStreamView";
import StreamView from "../../../components/StreamView";
import { useSession } from "next-auth/react";

export default function Component({params}:{params:{spaceId:string}}) {
  const { socket, user, connectionError } = useSocket();
  useRedirect();

  useEffect(() => {
    if (user) {
      const token = jwt.sign(
        {
          creatorId: user?.id,
          userId: user?.id,
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

  if (connectionError) {
    return <h1>Cannot connect to socket server</h1>;
  }

  if (!user) {
    return <h1>Please Log in....</h1>;
  }

// ------------- If using oldstream view
  // const session = useSession(); 
 
  // if (session.status === "loading") {
  //     return <div>Loading...</div>;
  // }

  // if (!session.data?.user.id) {
  //     return <h1>Please Log in....</h1>;
  // }

  // return <OldStreamView creatorId={session.data.user.id} spaceId={params.spaceId} playVideo={true} />;
  return <StreamView creatorId={user.id} playVideo={true} />;
  
}

export const dynamic = "auto";
