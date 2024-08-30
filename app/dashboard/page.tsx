"use client";

import "react-toastify/dist/ReactToastify.css";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { useSession } from "next-auth/react";
import StreamView from "../components/StreamView";

export default function Component() {
  const session = useSession();

  return (
    <div>
      {session.data?.user && (
        <StreamView creatorId={session.data.user.id} playVideo />
      )}
    </div>
  );
}
