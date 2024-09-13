import { WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";
//@ts-ignore
import youtubesearchapi from "youtube-search-api";
import { Job, Queue, Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";

const TIME_SPAN_FOR_VOTE = 1200000; // 20min
const TIME_SPAN_FOR_QUEUE = 1200000; // 20min
const TIME_SPAN_FOR_REPEAT = 3600000;
const MAX_QUEUE_LENGTH = 20;

const connection = {
  username: process.env.REDIS_USERNAME || "",
  password: process.env.REDIS_PASSWORD || "",
  host: process.env.REDIS_HOST || "",
  port: parseInt(process.env.REDIS_PORT || "") || 6379,
};

const redisCredentials = {
  url: `redis://${connection.username}:${connection.password}@${connection.host}:${connection.port}`,
};

export class RoomManager {
  private static instance: RoomManager;
  public rooms: Map<string, Room>;
  public users: Map<string, User>;
  public redisClient: RedisClientType;
  public publisher: RedisClientType;
  public subscriber: RedisClientType;
  public prisma: PrismaClient;
  public queue: Queue;
  public worker: Worker;

  private constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.redisClient = createClient(redisCredentials);
    this.publisher = createClient(redisCredentials);
    this.subscriber = createClient(redisCredentials);
    this.prisma = new PrismaClient();
    this.queue = new Queue(process.pid.toString(), {
      connection,
    });
    this.worker = new Worker(process.pid.toString(), this.processJob, {
      connection,
    });
  }

  static getInstance() {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }

    return RoomManager.instance;
  }

  async processJob(job: Job) {
    const { data, name } = job;
    if (name === "cast-vote") {
      await RoomManager.getInstance().adminCastVote(
        data.creatorId,
        data.userId,
        data.streamId,
        data.vote
      );
    } else if (name === "add-to-queue") {
      await RoomManager.getInstance().adminAddStreamHandler(
        data.creatorId,
        data.userId,
        data.url,
        data.existingActiveStream
      );
    } else if (name === "play-next") {
      await RoomManager.getInstance().adminPlayNext(
        data.creatorId,
        data.userId
      );
    } else if (name === "remove-song") {
      await RoomManager.getInstance().adminRemoveSong(
        data.creatorId,
        data.userId,
        data.streamId
      );
    } else if (name === "empty-queue") {
      await RoomManager.getInstance().adminEmptyQueue(data.creatorId);
    }
  }

  async initRedisClient() {
    await this.redisClient.connect();
    await this.subscriber.connect();
    await this.publisher.connect();
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
    } else if (type === "remove-song") {
      RoomManager.getInstance().publishRemoveSong(creatorId, data.streamId);
    } else if (type === "empty-queue") {
      RoomManager.getInstance().publishEmptyQueue(creatorId);
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

  async addUser(userId: string, ws: WebSocket, token: string) {
    this.users.set(userId, {
      userId,
      ws,
      token,
    });
  }

  async joinRoom(
    creatorId: string,
    userId: string,
    ws: WebSocket,
    token: string
  ) {
    let room = this.rooms.get(creatorId);
    let user = this.users.get(userId);

    if (!room) {
      await this.createRoom(creatorId);
      room = this.rooms.get(creatorId);
    }

    if (!user) {
      await this.addUser(userId, ws, token);
      user = this.users.get(userId);
    }

    if (room && user) {
      this.rooms.set(creatorId, {
        ...room,
        spectators: [...new Set([...room.spectators, userId])],
      });
    }
  }

  publishEmptyQueue(creatorId: string) {
    const room = this.rooms.get(creatorId);
    room?.spectators.forEach((spectator) => {
      const user = this.users.get(spectator);
      user?.ws.send(
        JSON.stringify({
          type: "empty-queue",
        })
      );
    });
  }

  async adminEmptyQueue(creatorId: string) {
    const user = this.users.get(creatorId);
    const room = this.rooms.get(creatorId);

    if (room && user) {
      await this.prisma.stream.updateMany({
        where: {
          userId: creatorId,
          played: false,
        },
        data: {
          played: true,
          playedTs: new Date(),
        },
      });
      await this.publisher.publish(
        creatorId,
        JSON.stringify({
          type: "empty-queue",
        })
      );
    }
  }

  publishRemoveSong(creatorId: string, streamId: string) {
    console.log("publishRemoveSong");
    const room = this.rooms.get(creatorId);
    room?.spectators.forEach((spectator) => {
      const user = this.users.get(spectator);
      user?.ws.send(
        JSON.stringify({
          type: "remove-song",
          data: {
            streamId,
          },
        })
      );
    });
  }

  async adminRemoveSong(creatorId: string, userId: string, streamId: string) {
    console.log("adminRemoveSong");
    const user = this.users.get(userId);
    if (user) {
      await this.prisma.stream.delete({
        where: {
          id: streamId,
          userId: creatorId,
        },
      });

      await this.publisher.publish(
        creatorId,
        JSON.stringify({
          type: "remove-song",
          data: {
            streamId,
          },
        })
      );
    }
  }

  publishPlayNext(creatorId: string) {
    const room = this.rooms.get(creatorId);
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

    await this.queue.add("cast-vote", {
      creatorId,
      userId,
      streamId,
      vote,
    });
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

    const res = await youtubesearchapi.GetVideoDetails(extractedId);

    if (res.thumbnail) {
      const thumbnails = res.thumbnail.thumbnails;
      thumbnails.sort((a: { width: number }, b: { width: number }) =>
        a.width < b.width ? -1 : 1
      );
      const stream = await this.prisma.stream.create({
        data: {
          id: crypto.randomUUID(),
          userId: creatorId,
          url: url,
          extractedId,
          type: "Youtube",
          addedBy: userId,
          title: res.title ?? "Cant find video",
          // smallImg: video.thumbnails.medium.url,
          // bigImg: video.thumbnails.high.url,
          smallImg:
            (thumbnails.length > 1
              ? thumbnails[thumbnails.length - 2].url
              : thumbnails[thumbnails.length - 1].url) ??
            "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
          bigImg:
            thumbnails[thumbnails.length - 1].url ??
            "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
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
          type: "error",
          data: {
            message: "You can add again after 20 min.",
          },
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

    await this.queue.add("add-to-queue", {
      creatorId,
      userId: currentUser.userId,
      url,
      existingActiveStream: previousQueueLength,
    });
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
  token: string;
};

type Room = {
  creatorId: string;
  spectators: string[];
};
