import { YT_REGEX } from "@/app/lib/utils";
import { useSocket } from "@/context/socket-context";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { Share2 } from "lucide-react";

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

  const handleShare = () => {
    const shareableLink = `${window.location.hostname}/creator/${creatorId}`;
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        enqueueToast("success", "Link copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        enqueueToast("error", "Failed to copy link. Please try again.");
      }
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Add a song</h1>
        <Button
          onClick={handleShare}
          className="bg-purple-700 hover:bg-purple-800 text-white"
        >
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          placeholder="Please paste your link"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
          className="bg-gray-900 text-white border-gray-700 placeholder-gray-500"
        />
        <Button
          disabled={loading}
          onClick={handleSubmit}
          type="submit"
          className="w-full bg-purple-700 hover:bg-purple-800 text-white"
        >
          {loading ? "Loading..." : "Add to Queue"}
        </Button>
      </form>

      {inputLink && inputLink.match(YT_REGEX) && !loading && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
