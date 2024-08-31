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
      if (type === "create-room") {
        // data: {creatorId: string}
        // await RoomManager.getInstance().publisher.publish(
        //   "create-room",
        //   JSON.stringify(data)
        // );
      } else if (type === "join-room") {
        // data: {creatorId: string, userId: string}
        RoomManager.getInstance().addUser(data.userId, ws);
        RoomManager.getInstance().joinRoom(data.creatorId, data.userId);
      } else if (type === "cast-vote") {
        // data: {creatorId: string, userId: string, streamId: string}
        await RoomManager.getInstance().publisher.publish(
          data.creatorId,
          JSON.stringify({
            type: "cast-vote",
            data: {
              userId: data.userId,
              streamId: data.streamId,
              vote: data.vote,
            },
          })
        );
      } else if (type === "add-to-queue") {
        // data: {creatorId: string, userId: string, url: string}
        await RoomManager.getInstance().addToQueue(
          data.creatorId,
          data.userId,
          data.url
        );
        // await RoomManager.getInstance().publisher.publish(
        //   data.creatorId,
        //   JSON.stringify({
        //     type: "add-to-queue",
        //     data: {
        //       userId: data.userId,
        //       url: data.url,
        //     },
        //   })
        // );
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
