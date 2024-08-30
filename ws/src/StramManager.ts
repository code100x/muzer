import { WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";
const TIME_SPAN_FOR_VOTE = 1200000 / 20; // 20min
const TIME_SPAN_FOR_QUEUE = 1200000 / 20; // 20min
const TIME_SPAN_FOR_REPEAT = 3600000;
const QUEUE_LENGTH = 20;

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

    await this.subscriber.subscribe("create-room", (message) => {
      const data = JSON.parse(message);
      this.createRoom(data.creatorId);
    });

    const rooms = await this.redisClient.get("rooms");
    if (rooms) {
      await this.subscriber.subscribe(JSON.parse(rooms), this.onSubscribeRoom);
    }
  }

  onSubscribeRoom(message: string, creatorId: string) {
    const { type, data } = JSON.parse(message);
    console.log("redis: " + process.pid + " : " + creatorId, type, data);
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
      RoomManager.getInstance().publishNewVote(
        creatorId,
        data.streamId,
        data.vote,
        data.votedBy
      );
    }
  }

  createRoom(creatorId: string) {
    console.log(process.pid + " :createRoom: " + creatorId);
    if (!this.rooms.has(creatorId)) {
      this.rooms.set(creatorId, {
        creatorId,
        queueLength: 0,
        spectators: [],
      });
      this.redisClient.get("rooms").then((roomsString) => {
        if (roomsString) {
          const rooms = JSON.parse(roomsString);
          if (!rooms.includes(creatorId)) {
            this.redisClient.set(
              "rooms",
              JSON.stringify([...rooms, creatorId])
            );
          }
        } else {
          this.redisClient.set("rooms", JSON.stringify([creatorId]));
        }
        this.subscriber.subscribe(creatorId, this.onSubscribeRoom);
      });
    }
  }

  async addUser(userId: string, ws: WebSocket) {
    const cachedUserData = await this.redisClient.get(userId);

    this.users.set(userId, {
      userId,
      ws,
      ...(cachedUserData
        ? JSON.parse(cachedUserData)
        : {
            lastVoted: new Date().getTime() - TIME_SPAN_FOR_VOTE,
            lastAdded: new Date().getTime() - TIME_SPAN_FOR_VOTE,
          }),
    });
  }

  joinRoom(creatorId: string, userId: string) {
    const room = this.rooms.get(creatorId);
    const user = this.users.get(userId);
    if (room && user) {
      this.rooms.set(creatorId, {
        ...room,
        spectators: [...room.spectators, userId],
      });
    }
  }

  publishNewVote(
    creatorId: string,
    streamId: string,
    vote: "upvote" | "downvote",
    votedBy: string
  ) {
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

  async castVote(
    creatorId: string,
    currentUserId: string,
    streamId: string,
    vote: "upvote" | "downvote"
  ) {
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
    const room = RoomManager.getInstance().rooms.get(creatorId);
    RoomManager.getInstance().rooms.forEach((r) => {
      console.log(room);
    });
    console.log(`${process.pid} - ${room || "No rooms found"} - ${url}`);
    if (room) {
      room.spectators.forEach((spectatorId) => {
        const spectator = this.users.get(spectatorId);
        spectator?.ws.send(
          JSON.stringify({
            type: "add-to-queue",
            data: {
              url,
            },
          })
        );
      });
      this.rooms.set(creatorId, {
        ...room,
        queueLength: room.queueLength + 1,
      });
    }
  }

  async addToQueue(creatorId: string, currentUserId: string, url: string) {
    const room = this.rooms.get(creatorId);
    const currentUser = this.users.get(currentUserId);

    if (!room) {
      return;
    }
    let lastAdded = await this.redisClient.get(`lastAdded-${currentUserId}`);

    let alreadyAdded = await this.redisClient.get(url);

    if (
      currentUser &&
      !lastAdded &&
      // currentUser.lastAdded + TIME_SPAN_FOR_QUEUE < lastAdded &&
      room.queueLength < QUEUE_LENGTH
    ) {
      if (alreadyAdded) {
        currentUser?.ws.send(
          JSON.stringify({
            type: "song-blocked",
          })
        );
        return;
      }
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

      this.publisher.publish(
        room.creatorId,
        JSON.stringify({
          type: "new-stream",
          data: {
            url,
          },
        })
      );
    } else {
      currentUser?.ws.send(
        JSON.stringify({
          type: "add-to-queue-not-allowed",
        })
      );
    }
  }

  disconnect(ws: WebSocket) {
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
  queueLength: number;
  spectators: string[];
};
