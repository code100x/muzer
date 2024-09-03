import { WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const TIME_SPAN_FOR_VOTE = 1200000 / 20; // 20min
const TIME_SPAN_FOR_QUEUE = 1200000 / 20; // 20min
const TIME_SPAN_FOR_REPEAT = 3600000 / 60;
const MAX_QUEUE_LENGTH = 20;

const redisCredentials = {
  url: process.env.REDIS_URL,
};

export class RoomManager {
  private static instance: RoomManager;
  public rooms: Map<string, Room>;
  public users: Map<string, User>;
  public redisClient: RedisClientType;
  public publisher: RedisClientType;
  public subscriber: RedisClientType;
  public prisma: PrismaClient;

  private constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.redisClient = createClient(redisCredentials);
    this.publisher = createClient(redisCredentials);
    this.subscriber = createClient(redisCredentials);
    this.prisma = new PrismaClient();
  }

  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }

    return RoomManager.instance;
  }

  async initRedisClient() {
    await this.redisClient.connect();
    await this.subscriber.connect();
    await this.publisher.connect();

    await this.subscriber.subscribe(process.pid.toString(), (message) => {
      const { type, data } = JSON.parse(message);
      if (type === "add-to-queue") {
        RoomManager.getInstance().adminAddStreamHandler(
          data.creatorId,
          data.userId,
          data.url,
          data.existingActiveStream
        );
      } else if (type === "cast-vote") {
        RoomManager.getInstance().adminCastVote(
          data.creatorId,
          data.userId,
          data.streamId,
          data.vote
        );
      } else if (type === "play-next") {
        RoomManager.getInstance().adminPlayNext(data.creatorId, data.userId);
      }
    });
  }

  onSubscribeRoom(message: string, creatorId: string) {
    const { type, data } = JSON.parse(message);
    if (type === "new-stream") {
      RoomManager.getInstance().publishNewStream(creatorId, data);
    } else if (type === "new-vote") {
      RoomManager.getInstance().publishNewVote(
        creatorId,
        data.streamId,
        data.vote,
        data.votedBy
      );
    } else if (type === "play-next") {
      RoomManager.getInstance().publishPlayNext(creatorId);
    }
  }

  async createRoom(creatorId: string) {
    console.log(process.pid + ": createRoom: ", { creatorId });
    if (!this.rooms.has(creatorId)) {
      this.rooms.set(creatorId, {
        creatorId,
        spectators: [],
      });
      // const roomsString = await this.redisClient.get("rooms");
      // if (roomsString) {
      //   const rooms = JSON.parse(roomsString);
      //   if (!rooms.includes(creatorId)) {
      //     await this.redisClient.set(
      //       "rooms",
      //       JSON.stringify([...rooms, creatorId])
      //     , {
      //       EX: 3600 * 24
      //     });
      //   }
      // } else {
      //   await this.redisClient.set("rooms", JSON.stringify([creatorId]));
      // }
      await this.subscriber.subscribe(creatorId, this.onSubscribeRoom);
    }
  }

  async addUser(userId: string, ws: WebSocket) {
    this.users.set(userId, {
      userId,
      ws,
    });
  }

  async joinRoom(creatorId: string, userId: string, ws: WebSocket) {
    let room = this.rooms.get(creatorId);
    let user = this.users.get(userId);

    if (!room) {
      await this.createRoom(creatorId);
      room = this.rooms.get(creatorId);
    }

    if (!user) {
      await this.addUser(userId, ws);
      user = this.users.get(userId);
    }

    if (room && user) {
      this.rooms.set(creatorId, {
        ...room,
        spectators: [...room.spectators, userId],
      });
    }
  }

  publishPlayNext(creatorId: string) {
    console.log("publishPlayNext");
    const room = this.rooms.get(creatorId);
    console.log({ room });
    room?.spectators.forEach((spectator) => {
      const user = this.users.get(spectator);
      user?.ws.send(
        JSON.stringify({
          type: "play-next",
        })
      );
    });
  }

  async adminPlayNext(creatorId: string, userId: string) {
    console.log("adminPlayNext");
    let targetUser = this.users.get(userId);
    if (!targetUser) {
      return;
    }

    if (targetUser.userId !== creatorId) {
      targetUser.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "You can't perform this action.",
          },
        })
      );
      return;
    }

    const mostUpvotedStream = await this.prisma.stream.findFirst({
      where: {
        userId,
        played: false,
      },
      orderBy: {
        Upvote: {
          _count: "desc",
        },
      },
    });

    if (!mostUpvotedStream) {
      targetUser.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "Please add video in queue",
          },
        })
      );
      return;
    }

    await Promise.all([
      this.prisma.currentStream.upsert({
        where: {
          userId,
        },
        update: {
          userId,
          streamId: mostUpvotedStream.id,
        },
        create: {
          userId,
          streamId: mostUpvotedStream.id,
        },
      }),
      this.prisma.stream.update({
        where: {
          id: mostUpvotedStream.id,
        },
        data: {
          played: true,
          playedTs: new Date(),
        },
      }),
    ]);

    let previousQueueLength = parseInt(
      (await this.redisClient.get(`queue-length-${creatorId}`)) || "1",
      10
    );
    if (previousQueueLength) {
      await this.redisClient.set(
        `queue-length-${creatorId}`,
        previousQueueLength - 1
      );
    }

    await this.publisher.publish(
      creatorId,
      JSON.stringify({
        type: "play-next",
      })
    );
  }

  publishNewVote(
    creatorId: string,
    streamId: string,
    vote: "upvote" | "downvote",
    votedBy: string
  ) {
    console.log(process.pid + " publishNewVote");
    const room = this.rooms.get(creatorId);
    room?.spectators.forEach((spectator) => {
      const user = this.users.get(spectator);
      user?.ws.send(
        JSON.stringify({
          type: "new-vote",
          data: {
            vote,
            streamId,
            votedBy,
          },
        })
      );
    });
  }

  async adminCastVote(
    creatorId: string,
    userId: string,
    streamId: string,
    vote: string
  ) {
    console.log(process.pid + " adminCastVote");
    if (vote === "upvote") {
      await this.prisma.upvote.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          streamId,
        },
      });
    } else {
      await this.prisma.upvote.delete({
        where: {
          userId_streamId: {
            userId,
            streamId,
          },
        },
      });
    }
    await this.redisClient.set(
      `lastVoted-${creatorId}-${userId}`,
      new Date().getTime(),
      {
        EX: TIME_SPAN_FOR_VOTE / 1000,
      }
    );

    await this.publisher.publish(
      creatorId,
      JSON.stringify({
        type: "new-vote",
        data: { streamId, vote, votedBy: userId },
      })
    );
  }

  async castVote(
    creatorId: string,
    userId: string,
    streamId: string,
    vote: "upvote" | "downvote"
  ) {
    console.log(process.pid + " castVote");
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(userId);

    if (!room || !currentUser) {
      return;
    }

    const lastVoted = await this.redisClient.get(
      `lastVoted-${creatorId}-${userId}`
    );

    if (lastVoted) {
      currentUser?.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "You can vote after 20 mins",
          },
        })
      );
      return;
    }

    await this.publisher.publish(
      process.pid.toString(),
      JSON.stringify({
        type: "cast-vote",
        data: {
          creatorId,
          userId,
          streamId,
          vote,
        },
      })
    );
  }

  publishNewStream(creatorId: string, data: any) {
    console.log(process.pid + ": publishNewStream");
    const room = RoomManager.getInstance().rooms.get(creatorId);

    if (room) {
      room.spectators.forEach((spectatorId) => {
        const spectator = this.users.get(spectatorId);
        spectator?.ws.send(
          JSON.stringify({
            type: "new-stream",
            data: data,
          })
        );
      });
    }
  }

  async adminAddStreamHandler(
    creatorId: string,
    userId: string,
    url: string,
    existingActiveStream: number
  ) {
    console.log(process.pid + " adminAddStreamHandler");
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(userId);

    if (!room || typeof existingActiveStream !== "number") {
      return;
    }

    const extractedId = url.split("?v=")[1];
    await this.redisClient.set(
      `queue-length-${room.creatorId}`,
      existingActiveStream + 1
    );

    const {
      data: { items },
    } = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        key: process.env.GOOGLE_API_KEY,
        id: extractedId,
        part: "snippet",
      },
    });

    const video = items?.[0]?.snippet;
    if (video) {
      const stream = await this.prisma.stream.create({
        data: {
          id: crypto.randomUUID(),
          userId: creatorId,
          url: url,
          extractedId,
          type: "Youtube",
          title: video.title ?? "Cant find video",
          smallImg: video.thumbnails.medium.url,
          bigImg: video.thumbnails.high.url,
        },
      });

      await this.redisClient.set(
        `${room.creatorId}-${url}`,
        new Date().getTime(),
        {
          EX: TIME_SPAN_FOR_REPEAT / 1000,
        }
      );

      await this.redisClient.set(`lastAdded-${userId}`, new Date().getTime(), {
        EX: TIME_SPAN_FOR_QUEUE / 1000,
      });

      await this.publisher.publish(
        creatorId,
        JSON.stringify({
          type: "new-stream",
          data: {
            ...stream,
            hasUpvoted: false,
            upvotes: 0,
          },
        })
      );
    } else {
      currentUser?.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "Video not found",
          },
        })
      );
    }
  }

  async addToQueue(creatorId: string, currentUserId: string, url: string) {
    console.log(process.pid + ": addToQueue");
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(currentUserId);

    if (!room || !currentUser) {
      console.log("433: Room or User not defined");
      return;
    }
    let lastAdded = await this.redisClient.get(`lastAdded-${currentUserId}`);

    if (lastAdded) {
      currentUser.ws.send(
        JSON.stringify({
          type: "add-to-queue-not-allowed",
        })
      );
      return;
    }
    let alreadyAdded = await this.redisClient.get(`${room.creatorId}-${url}`);

    if (alreadyAdded) {
      currentUser.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "This song is blocked for 1 hour",
          },
        })
      );
      return;
    }

    let previousQueueLength = parseInt(
      (await this.redisClient.get(`queue-length-${room.creatorId}`)) || "0",
      10
    );

    // Checking if its zero that means there was no record in
    if (!previousQueueLength) {
      previousQueueLength = await this.prisma.stream.count({
        where: {
          userId: creatorId,
          played: false,
        },
      });
    }

    if (previousQueueLength >= MAX_QUEUE_LENGTH) {
      currentUser.ws.send(
        JSON.stringify({
          type: "error",
          data: {
            message: "Queue limit reached",
          },
        })
      );
      return;
    }

    await this.publisher.publish(
      process.pid.toString(),
      JSON.stringify({
        type: "add-to-queue",
        data: {
          creatorId,
          userId: currentUser.userId,
          url,
          existingActiveStream: previousQueueLength,
        },
      })
    );
  }

  disconnect(ws: WebSocket) {
    console.log(process.pid + ": disconnect");
    let user: string | null = null;
    this.users.forEach((usr) => {
      if (!user && usr.ws === ws) {
        user = usr.userId;
      }
    });

    if (user) {
      this.rooms.forEach((room) => {
        if (room.spectators.includes(user || "")) {
          this.rooms.set(room.creatorId, {
            ...room,
            spectators: room.spectators.filter((userId) => userId !== user),
          });
        }
      });
      this.users.delete(user);
    }
  }
}

type User = {
  userId: string;
  ws: WebSocket;
};

type Room = {
  creatorId: string;
  spectators: string[];
};
