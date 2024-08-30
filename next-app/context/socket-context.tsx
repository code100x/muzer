import { User } from "@prisma/client";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type SocketContextType = {
  socket: null | WebSocket;
  user: User | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  user: null,
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<null | User>(null);

  // useEffect(() => {
  //   if (user) {
  //     socket?.
  //   }
  // }, [user]);

  useEffect(() => {
    if (!socket) {
      console.log("Connecting to ws");
      const ws = new WebSocket("ws://localhost:8080");
      ws.onopen = () => {
        setSocket(ws);
        (async () => {
          const res = await fetch("/api/user");
          const data = await res.json();
          ws.send(
            JSON.stringify({
              type: "add-user",
              data: {
                userId: data.user.id,
              },
            })
          );
          setUser(data.user);
        })();
      };

      ws.onclose = () => {
        setSocket(null);
      };

      ws.onerror = () => {
        console.log("Something went wrong");
        setSocket(null);
      };

      () => {
        ws.close();
      };
    }
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        user,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const { socket, user } = useContext(SocketContext);

  const sendMessage = (type: string, data: { [key: string]: any }) => {
    socket?.send(
      JSON.stringify({
        type,
        data,
      })
    );
  };

  return { socket, sendMessage, user };
};
