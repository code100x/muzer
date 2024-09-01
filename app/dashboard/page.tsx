"use client";
import "react-toastify/dist/ReactToastify.css";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import StreamView from "../components/StreamView";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  const session = useSession();
  const router = useRouter();
  try {
    if (!session.data?.user.id) {
      return router.push("/auth");
    }

    return (
      <StreamView
        creatorId={session?.data?.user.id}
        playVideo={true}
      />
    );
  } catch (e) {
    return null;
  }
}

export const dynamic = "auto";
