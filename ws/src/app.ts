import { WebSocketServer } from "ws";
import { RoomManager } from "./StramManager";
import cluster from "cluster";
import os from "os";

const cors = 2; //os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < cors; i++) {
    cluster.fork();
  }

  cluster.on("disconnect", () => {
    process.exit();
  });
} else {
  main();
}

async function main() {
  const wss = new WebSocketServer({ port: 8080 });
  await RoomManager.getInstance().initRedisClient();

  wss.on("connection", (ws) => {
    ws.on("message", async (raw) => {
      const { type, data } = JSON.parse(raw.toString()) || {};
      if (type === "join-room") {
        RoomManager.getInstance().joinRoom(data.creatorId, data.userId, ws);
      } else if (type === "cast-vote") {
        await RoomManager.getInstance().castVote(
          data.creatorId,
          data.userId,
          data.streamId,
          data.vote
        );
      } else if (type === "casted-vote") {
        await RoomManager.getInstance().castedVote(
          data.creatorId,
          data.userId,
          data.streamId,
          data.vote
        );
      } else if (type === "add-to-queue") {
        await RoomManager.getInstance().addToQueue(
          data.creatorId,
          data.userId,
          data.url
        );
      } else if (type === "added-to-stream") {
        await RoomManager.getInstance().addedToQueue(
          data.creatorId,
          data.userId,
          data.url
        );
      } else if (type === "play-next") {
        await RoomManager.getInstance().publisher.publish(
          data.creatorId,
          JSON.stringify({
            type: "play-next",
          })
        );
        await RoomManager.getInstance().playNextHandler(data.creatorId, ws);
      }
    });

    ws.on("close", () => {
      RoomManager.getInstance().disconnect(ws);
    });
  });

  console.log(`${process.pid}: ` + "WebSocket server is running on 8080");
}
