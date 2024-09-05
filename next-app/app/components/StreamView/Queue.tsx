import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { useSocket } from "@/context/socket-context";

type Props = {
  queue: Video[];
  creatorId: string;
  userId: string;
};

export default function Queue({ queue, creatorId, userId }: Props) {
  const { sendMessage } = useSocket();

  function handleVote(id: string, isUpvote: boolean) {
    sendMessage("cast-vote", {
      vote: isUpvote ? "upvote" : "downvote",
      streamId: id,
      userId,
      creatorId,
    });
  }

  return (
    <div className="col-span-3">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Upcoming Songs</h2>
        {queue.length === 0 && (
          <Card className="bg-gray-900 border-gray-800 w-full">
            <CardContent className="p-4">
              <p className="text-center py-8 text-gray-400">
                No videos in queue
              </p>
            </CardContent>
          </Card>
        )}
        {queue.map((video) => (
          <Card key={video.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex items-center space-x-4">
              <img
                src={video.smallImg}
                alt={`Thumbnail for ${video.title}`}
                className="w-30 h-20 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-white">{video.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleVote(video.id, video.haveUpvoted ? false : true)
                    }
                    className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                  >
                    {video.haveUpvoted ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                    <span>{video.upvotes}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
