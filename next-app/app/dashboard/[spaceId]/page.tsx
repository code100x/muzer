"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/socket-context";
import useRedirect from "../../../hooks/useRedirect";
import jwt from "jsonwebtoken";
import OldStreamView from "../../../components/OldStreamView";
import StreamView from "../../../components/StreamView";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";

export default function Component({params}:{params:{spaceId:string}}) {
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
