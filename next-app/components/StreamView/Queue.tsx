import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play, Share2, Trash2, X } from "lucide-react";
import { useSocket } from "@/context/socket-context";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  queue: Video[];
  creatorId: string;
  userId: string;
  isCreator: boolean;
};

export default function Queue({ queue, isCreator, creatorId, userId }: Props) {
  const { sendMessage } = useSocket();
  const [isEmptyQueueDialogOpen, setIsEmptyQueueDialogOpen] = useState(false);

  function handleVote(id: string, isUpvote: boolean) {
    sendMessage("cast-vote", {
      vote: isUpvote ? "upvote" : "downvote",
      streamId: id,
      userId,
      creatorId,
    });
  }

  const handleShare = () => {
    const shareableLink = `${window.location.origin}/creator/${creatorId}`;
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
      creatorId: userId,
    });
    setIsEmptyQueueDialogOpen(false);
    // try {
    //   const res = await fetch("/api/streams/empty-queue", {
    //     method: "POST",
    //   });
    //   const data = await res.json();
    //   if (res.ok) {
    //     toast.success(data.message);
    //     refreshStreams();
    //   } else {
    //     toast.error(data.message || "Failed to empty queue");
    //   }
    // } catch (error) {
    //   console.error("Error emptying queue:", error);
    //   toast.error("An error occurred while emptying the queue");
    // }
  };

  const removeSong = async (streamId: string) => {
    sendMessage("remove-song", {
      streamId,
      userId,
      creatorId,
    });
    // try {
    //   const res = await fetch(`/api/streams/remove?streamId=${streamId}`, {
    //     method: "DELETE",
    //   });
    //   if (res.ok) {
    //     toast.success("Song removed successfully");
    //     refreshStreams();
    //   } else {
    //     toast.error("Failed to remove song");
    //   }
    // } catch (error) {
    //   toast.error("An error occurred while removing the song");
    // }
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
          {queue.map((video) => (
            <Card key={video.id} className="">
              <CardContent className="flex items-center space-x-4 p-4">
                <img
                  src={video.smallImg}
                  alt={`Thumbnail for ${video.title}`}
                  className="w-30 h-20 rounded object-cover"
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
