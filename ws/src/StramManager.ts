import { WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";

const TIME_SPAN_FOR_VOTE = 1200000; // 20min
const TIME_SPAN_FOR_QUEUE = 1200000; // 20min
const TIME_SPAN_FOR_REPEAT = 3600000;
const MAX_QUEUE_LENGTH = 20;

export class RoomManager {
  private static instance: RoomManager;
  public rooms: Map<string, Room>;
  public users: Map<string, User>;
  public redisClient: RedisClientType;
  public publisher: RedisClientType;
  public subscriber: RedisClientType;

  private constructor() {
    this.rooms = new Map();
    this.users = new Map();
    this.redisClient = createClient();
    this.publisher = createClient();
    this.subscriber = createClient();
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

    // await this.subscriber.subscribe("create-room", (message) => {
    //   const data = JSON.parse(message);
    //   this.createRoom(data.creatorId);
    // });

    const rooms = await this.redisClient.get("rooms");
    if (rooms) {
      await this.subscriber.subscribe(JSON.parse(rooms), this.onSubscribeRoom);
    }
  }

  onSubscribeRoom(message: string, creatorId: string) {
    const { type, data } = JSON.parse(message);
    if (type === "cast-vote") {
      RoomManager.getInstance().castVote(
        creatorId,
        data.userId,
        data.streamId,
        data.vote
      );
    } else if (type === "add-to-queue") {
      RoomManager.getInstance().addToQueue(creatorId, data.userId, data.url);
    } else if (type === "new-stream") {
      RoomManager.getInstance().publishNewStream(creatorId, data.url);
    } else if (type === "new-vote") {
      console.log(
        RoomManager.getInstance().rooms.get(creatorId)?.spectators ||
          `${creatorId}: ${RoomManager.getInstance().users.size}: No spectators`
      );
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
      const roomsString = await this.redisClient.get("rooms");
      if (roomsString) {
        const rooms = JSON.parse(roomsString);
        if (!rooms.includes(creatorId)) {
          await this.redisClient.set(
            "rooms",
            JSON.stringify([...rooms, creatorId])
          );
        }
      } else {
        await this.redisClient.set("rooms", JSON.stringify([creatorId]));
      }
      await this.subscriber.subscribe(creatorId, this.onSubscribeRoom);
    }
  }

  async addUser(userId: string, ws: WebSocket) {
    console.log("addUser", { userId });
    this.users.set(userId, {
      userId,
      ws,
    });
  }

  async joinRoom(creatorId: string, userId: string) {
    let room = this.rooms.get(creatorId);
    let user = this.users.get(userId);

    if (!room) {
      await this.createRoom(creatorId);
      room = this.rooms.get(creatorId);
    }

    if (room && user) {
      this.rooms.set(creatorId, {
        ...room,
        spectators: [...room.spectators, userId],
      });
    }
  }

  publishPlayNext(creatorId: string) {
    console.log(process.pid + ": publishPlayNext");
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

  async playNextHandler(creatorId: string, socket: WebSocket) {
    console.log(process.pid + ": playNextHandler");
    let targetUser: any = null;
    this.users.forEach((user) => {
      if (!targetUser && user.ws === socket) {
        targetUser = user;
      }
    });
    if (targetUser && targetUser.userId === creatorId) {
      let previousQueueLength: string =
        (await this.redisClient.get(`queue-length-${creatorId}`)) || "1";
      if (previousQueueLength) {
        await this.redisClient.set(
          `queue-length-${creatorId}`,
          parseInt(previousQueueLength, 10) - 1
        );
      }
    }
  }

  publishNewVote(
    creatorId: string,
    streamId: string,
    vote: "upvote" | "downvote",
    votedBy: string
  ) {
    console.log(process.pid + ": publishNewVote");
    const room = this.rooms.get(creatorId);
    console.log({ publishNewVote: creatorId, users: room?.spectators });
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

  async castVote(
    creatorId: string,
    currentUserId: string,
    streamId: string,
    vote: "upvote" | "downvote"
  ) {
    console.log(process.pid + ": castVote");
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(currentUserId);

    if (!room) {
      return;
    }

    const lastVoted = await this.redisClient.get(`lastVoted-${currentUserId}`);

    if (currentUser && !lastVoted) {
      this.users.set(currentUserId, {
        ...currentUser,
      });

      currentUser.ws.send(
        JSON.stringify({
          type: "cast-vote",
          data: {
            streamId,
            vote,
          },
        })
      );

      await this.redisClient.set(
        `lastVoted-${currentUser.userId}`,
        new Date().getTime(),
        {
          EX: TIME_SPAN_FOR_VOTE / 1000,
        }
      );

      await this.publisher.publish(
        creatorId,
        JSON.stringify({
          type: "new-vote",
          data: { streamId, vote, votedBy: currentUser.userId },
        })
      );
    } else {
      currentUser?.ws.send(
        JSON.stringify({
          type: "vote-not-allowed",
        })
      );
    }
  }

  publishNewStream(creatorId: string, url: string) {
    console.log(process.pid + ": publishNewStream");
    const room = RoomManager.getInstance().rooms.get(creatorId);

    if (room) {
      room.spectators.forEach((spectatorId) => {
        const spectator = this.users.get(spectatorId);
        spectator?.ws.send(
          JSON.stringify({
            type: "new-stream",
            data: {
              url,
            },
          })
        );
      });
      // this.rooms.set(creatorId, {
      //   ...room,
      //   queueLength: room.queueLength + 1,
      // });
    }
  }

  async addedToQueue(creatorId: string, userId: string, url: string) {
    const streamUrl = await this.redisClient.get(
      `new-stream-${userId}-${creatorId}`
    );
    console.log("addedToQueue", { creatorId, userId, url, streamUrl });
    if (streamUrl === url) {
      await this.publisher.publish(
        creatorId,
        JSON.stringify({
          type: "new-stream",
          data: {
            url,
          },
        })
      );
      await this.redisClient.del("new-stream");
    }
  }

  async addToQueue(creatorId: string, currentUserId: string, url: string) {
    console.log(process.pid + ": addToQueue");
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(currentUserId);

    if (!room || !currentUser) {
      return;
    }
    let lastAdded = await this.redisClient.get(`lastAdded-${currentUserId}`);

    let alreadyAdded = await this.redisClient.get(url);

    let previousQueueLength: number = parseInt(
      (await this.redisClient.get(`queue-length-${room.creatorId}`)) || "0",
      10
    );

    if (!lastAdded) {
      if (alreadyAdded) {
        currentUser?.ws.send(
          JSON.stringify({
            type: "song-blocked",
          })
        );
        return;
      }

      if (previousQueueLength >= MAX_QUEUE_LENGTH) {
        currentUser?.ws.send(
          JSON.stringify({
            type: "max-queue-length",
          })
        );
        return;
      }

      await this.redisClient.set(
        `queue-length-${room.creatorId}`,
        previousQueueLength + 1
      );
      this.users.set(currentUserId, {
        ...currentUser,
      });

      await this.redisClient.set(url, new Date().getTime(), {
        EX: TIME_SPAN_FOR_REPEAT / 1000,
      });

      await this.redisClient.set(
        `lastAdded-${currentUser.userId}`,
        new Date().getTime(),
        {
          EX: TIME_SPAN_FOR_QUEUE / 1000,
        }
      );

      await this.redisClient.set(
        `new-stream-${currentUser.userId}-${creatorId}`,
        url
      );

      currentUser?.ws.send(
        JSON.stringify({
          type: "add-to-stream",
          data: {
            url,
          },
        })
      );
    } else {
      currentUser.ws.send(
        JSON.stringify({
          type: "add-to-queue-not-allowed",
        })
      );
    }
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
