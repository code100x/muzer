"use client";

import "react-toastify/dist/ReactToastify.css";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { useSession } from "next-auth/react";
import StreamView from "../components/StreamView";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Component() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div>
      {session.data?.user && (
        <StreamView creatorId={session.data.user.id} playVideo />
      )}
    </div>
  );
}
