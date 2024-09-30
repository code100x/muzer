import { WebSocket, WebSocketServer } from "ws";
import cluster from "cluster";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendError } from "./utils";
// import os from "os";

import { RoomManager } from "./StreamManager";

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

type Data = {
  userId: string;
  spaceId: string;
  token: string;
  url: string;
  vote: "upvote" | "downvote";
  streamId: string;
};


function createHttpServer() {
  return http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello, this is some data from the server!");
  });
}

async function handleConnection(ws: WebSocket) {
  ws.on("message", async (raw: { toString: () => string }) => {
    const { type, data } = JSON.parse(raw.toString()) || {};

    switch (type) {
      case "join-room":
        await handleJoinRoom(ws, data);
        break;
      default:
        await handleUserAction(ws, type, data);
    }
  });

  ws.on("close", () => {
    RoomManager.getInstance().disconnect(ws);
  });
}

async function handleJoinRoom(ws: WebSocket, data: Data) {
  jwt.verify(
    data.token,
    process.env.NEXTAUTH_SECRET as string,
    (err: any, decoded: any) => {
      if (err) {
        console.error(err);
        sendError(ws, "Token verification failed");
      } else {
        RoomManager.getInstance().joinRoom(
          data.spaceId,
          decoded.creatorId,
          decoded.userId,
          ws,
          data.token
        );
      }
    }
  );
}

async function processUserAction(type: string, data: Data) {
  switch (type) {
    case "cast-vote":
      await RoomManager.getInstance().castVote(
        data.userId,
        data.streamId,
        data.vote,
        data.spaceId
      );
      break;

    case "add-to-queue":
      await RoomManager.getInstance().addToQueue(
        data.spaceId,
        data.userId,
        data.url
      );
      break;

    case "play-next":
      await RoomManager.getInstance().queue.add("play-next", {
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;

    case "remove-song":
      await RoomManager.getInstance().queue.add("remove-song", {
        ...data,
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;

    case "empty-queue":
      await RoomManager.getInstance().queue.add("empty-queue", {
        ...data,
        spaceId: data.spaceId,
        userId: data.userId,
      });
      break;

    case "pay-and-play-next":
      await RoomManager.getInstance().payAndPlayNext(
        data.spaceId,
        data.userId,
        data.url
      );
      break;

    default:
      console.warn("Unknown message type:", type);
  }
}

async function handleUserAction(ws: WebSocket, type: string, data: Data) {
  const user = RoomManager.getInstance().users.get(data.userId);

  if (user) {
    data.userId = user.userId;
    await processUserAction(type, data);
  } else {
    sendError(ws, "You are unauthorized to perform this action");
  }
}

async function main() {
  const server = createHttpServer();
  const wss = new WebSocketServer({ server });
  await RoomManager.getInstance().initRedisClient();

  wss.on("connection", (ws) => handleConnection(ws));

  const PORT = process.env.PORT ?? 8080;
  server.listen(PORT, () => {
    console.log(`${process.pid}: WebSocket server is running on ${PORT}`);
  });
}
