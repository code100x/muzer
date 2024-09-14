import { YT_REGEX } from "@/lib/utils";
import { useSocket } from "@/context/socket-context";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

type Props = {
  inputLink: string;
  creatorId: string;
  userId: string;
  setLoading: (value: boolean) => void;
  setInputLink: (value: string) => void;
  loading: boolean;
  enqueueToast: (type: "error" | "success", message: string) => void;
};

export default function AddSongForm({
  inputLink,
  enqueueToast,
  setInputLink,
  loading,
  setLoading,
  creatorId,
  userId,
}: Props) {
  const { sendMessage } = useSocket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLink.match(YT_REGEX)) {
      setLoading(true);
      sendMessage("add-to-queue", {
        creatorId,
        userId,
        url: inputLink,
      });
    } else {
      enqueueToast("error", "Invalid please use specified formate");
    }
    setInputLink("");
  };

  const videoId = inputLink ? inputLink.match(YT_REGEX)?.[1] : undefined;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add a song</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          placeholder="Please paste your link"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
        />
        <Button
          disabled={loading}
          onClick={handleSubmit}
          type="submit"
          className="w-full"
        >
          {loading ? "Loading..." : "Add to Queue"}
        </Button>
      </form>

      {videoId && !loading && (
        <Card>
          <CardContent className="p-4">
            <LiteYouTubeEmbed title="" id={videoId} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
