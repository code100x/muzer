"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
//@ts-ignore
import { ChevronUp, ChevronDown, ThumbsDown, Play, Share2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Appbar } from "../components/Appbar";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { YT_REGEX } from "../lib/utils";
import StreamView from "../components/StreamView";
import { useSocket } from "@/context/socket-context";

interface Video {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImg: string;
  bigImg: string;
  active: boolean;
  userId: string;
  upvotes: number;
  haveUpvoted: boolean;
}

const REFRESH_INTERVAL_MS = 10 * 1000;

const creatorId = "3ce10574-0396-43ac-8274-02882cde607b";

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
    return null;
  }

  return <StreamView creatorId={user.id} playVideo={true} />;
}

export const dynamic = "auto";
