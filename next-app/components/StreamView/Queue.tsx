import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play, Share2, Trash2, X } from "lucide-react";
import { useSocket } from "@/context/socket-context";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type Props = {
  queue: Video[];
  creatorId: string;
  userId: string;
  isCreator: boolean;
  spaceId:string
};

export default function Queue({ queue, isCreator, creatorId, userId,spaceId }: Props) {
  const { sendMessage } = useSocket();
  const [isEmptyQueueDialogOpen, setIsEmptyQueueDialogOpen] = useState(false);
  const [parent] = useAutoAnimate();

  function handleVote(id: string, isUpvote: boolean) {
    sendMessage("cast-vote", {
      vote: isUpvote ? "upvote" : "downvote",
      streamId: id,
      userId,
      creatorId,
      spaceId
    });
  }

  const handleShare = () => {
    const shareableLink = `${window.location.origin}/spaces/${spaceId}`;
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        toast.success("Link copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy link. Please try again.");
      },
    );
  };

  const emptyQueue = async () => {
    sendMessage("empty-queue", {
      spaceId:spaceId,
    });
    setIsEmptyQueueDialogOpen(false);
  };

  const removeSong = async (streamId: string) => {
    sendMessage("remove-song", {
      streamId,
      userId,
      spaceId,
    });
  };

  return (
    <>
      <div className="col-span-3">
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <h2 className="text-3xl font-bold">Upcoming Songs</h2>
            <div className="flex space-x-2">
              <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              {isCreator && (
                <Button
                  onClick={() => setIsEmptyQueueDialogOpen(true)}
                  variant="secondary"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Empty Queue
                </Button>
              )}
            </div>
          </div>
          {queue.length === 0 && (
            <Card className="w-full">
              <CardContent className="p-4">
                <p className="py-8 text-center">No videos in queue</p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4" ref={parent}>
          {queue.map((video) => (
            <Card key={video.id} className="">
              <CardContent className="flex items-center space-x-4 p-4">
                <Image
                height={80}
                width={128}
                  src={video.smallImg}
                  alt={`Thumbnail for ${video.title}`}
                  className="w-32 h-20 rounded object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{video.title}</h3>
                  <div className="mt-2 flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleVote(video.id, video.haveUpvoted ? false : true)
                      }
                      className="flex items-center space-x-1"
                    >
                      {video.haveUpvoted ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                      <span>{video.upvotes}</span>
                    </Button>
                    {isCreator && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSong(video.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      </div>
      <Dialog
        open={isEmptyQueueDialogOpen}
        onOpenChange={setIsEmptyQueueDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Queue</DialogTitle>
            <DialogDescription>
              Are you sure you want to empty the queue? This will remove all
              songs from the queue. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmptyQueueDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={emptyQueue} variant="destructive">
              Empty Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
