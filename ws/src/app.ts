import { WebSocketServer } from "ws";
import cluster from "cluster";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
// import os from "os";

import { RoomManager } from "./StramManager";

dotenv.config();
const cors = 1; // os.cpus().length  // for vertical scaling

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
  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");

    const data = "Hello, this is some data from the server!";
    res.write(data);
    res.end();
  });
  const wss = new WebSocketServer({ server });
  await RoomManager.getInstance().initRedisClient();

  wss.on("connection", (ws) => {
    ws.on("message", async (raw) => {
      const { type, data } = JSON.parse(raw.toString()) || {};
      if (type === "join-room") {
        jwt.verify(
          data.token,
          process.env.NEXTAUTH_SECRET as string,
          (err: any, decoded: any) => {
            console.log(err);
            if (err) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  data: {
                    message: "Token verification failed",
                  },
                })
              );
            } else {
              RoomManager.getInstance().joinRoom(
                decoded.creatorId,
                decoded.userId,
                ws
              );
            }
          }
        );
      } else if (type === "cast-vote") {
        await RoomManager.getInstance().castVote(
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
      } else if (type === "play-next") {
        await RoomManager.getInstance().queue.add("play-next", {
          creatorId: data.creatorId,
          userId: data.userId,
        });
      } else if (type === "remove-song") {
        await RoomManager.getInstance().queue.add("remove-song", data);
      } else if (type === "empty-queue") {
        await RoomManager.getInstance().queue.add("empty-queue", data);
      }
    });

    ws.on("close", () => {
      RoomManager.getInstance().disconnect(ws);
    });
  });

  const PORT = process.env.PORT;
  server.listen(PORT, () => {
    console.log(`${process.pid}: ` + "WebSocket server is running on " + PORT);
  });
}
