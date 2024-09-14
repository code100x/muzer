"use client";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";

import { useSocket } from "@/context/socket-context";
import { useSession } from "next-auth/react";
import NowPlaying from "./NowPlaying";
import Queue from "./Queue";
import AddSongForm from "./AddSongForm";
import { Appbar } from "../Appbar";

export default function StreamView({
  creatorId,
  playVideo = false,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const [inputLink, setInputLink] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);

  const { socket, sendMessage } = useSocket();
  const user = useSession().data?.user;

  useEffect(() => {
    if (socket) {
      socket.onmessage = async (event) => {
        const { type, data } = JSON.parse(event.data) || {};
        if (type === "new-stream") {
          addToQueue(data);
        } else if (type === "new-vote") {
          setQueue((prev) => {
            return prev
              .map((v) => {
                if (v.id === data.streamId) {
                  return {
                    ...v,
                    upvotes: v.upvotes + (data.vote === "upvote" ? 1 : -1),
                    haveUpvoted:
                      data.votedBy === user?.id
                        ? data.vote === "upvote"
                        : v.haveUpvoted,
                  };
                }
                return v;
              })
              .sort((a, b) => b.upvotes - a.upvotes);
          });
        } else if (type === "error") {
          enqueueToast("error", data.message);
          setLoading(false);
        } else if (type === "play-next") {
          await refreshStreams();
        } else if (type === "remove-song") {
          setQueue((prev) => {
            return prev.filter((stream) => stream.id !== data.streamId);
          });
        } else if (type === "empty-queue") {
          setQueue([]);
        }
      };
    }
  }, [socket]);

  useEffect(() => {
    refreshStreams();
  }, []);

  async function addToQueue(newStream: any) {
    setQueue((prev) => [...prev, newStream]);
    setInputLink("");
    setLoading(false);
  }

  async function refreshStreams() {
    try {
      const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
        credentials: "include",
      });
      const json = await res.json();
      setQueue(
        json.streams.sort((a: any, b: any) => (a.upvotes < b.upvotes ? 1 : -1)),
      );

      setCurrentVideo((video) => {
        if (video?.id === json.activeStream?.stream?.id) {
          return video;
        }
        return json.activeStream.stream;
      });
    } catch (error) {
      enqueueToast("error", "Something went wrong");
    }
    setPlayNextLoader(false);
  }

  const playNext = async () => {
    setPlayNextLoader(true);
    sendMessage("play-next", {
      creatorId,
      userId: user?.id,
    });
  };

  const enqueueToast = (type: "error" | "success", message: string) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Appbar />
      <div className="flex justify-center">
        <div className="grid w-screen max-w-screen-xl grid-cols-1 gap-4 pt-8 md:grid-cols-5">
          <Queue
            creatorId={creatorId}
            isCreator={playVideo}
            queue={queue}
            userId={user?.id || ""}
          />
          <div className="col-span-2">
            <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
              <AddSongForm
                creatorId={creatorId}
                userId={user?.id || ""}
                enqueueToast={enqueueToast}
                inputLink={inputLink}
                loading={loading}
                setInputLink={setInputLink}
                setLoading={setLoading}
              />

              <NowPlaying
                currentVideo={currentVideo}
                playNext={playNext}
                playNextLoader={playNextLoader}
                playVideo={playVideo}
              />
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
