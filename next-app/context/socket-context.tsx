import { useSession } from "next-auth/react";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type SocketContextType = {
  socket: null | WebSocket;
  user: null | { id: string };
  connectionError: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  user: null,
  connectionError: false,
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const session = useSession();

  useEffect(() => {
    if (!socket && session.data?.user.id) {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WSS_URL as string);
      ws.onopen = () => {
        setSocket(ws);
        setUser(session.data?.user);
      };

      ws.onclose = () => {
        setSocket(null);
      };

      ws.onerror = () => {
        setSocket(null);
        setConnectionError(true);
      };

      () => {
        ws.close();
      };
    }
  }, [socket, session.data]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        user,
        connectionError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const { socket, user, connectionError } = useContext(SocketContext);

  const sendMessage = (type: string, data: { [key: string]: any }) => {
    socket?.send(
      JSON.stringify({
        type,
        data,
      }),
    );
  };

  return { socket, sendMessage, user, connectionError };
};
