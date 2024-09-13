import { useSession } from "next-auth/react";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type SocketContextType = {
  socket: null | WebSocket;
  user: null | { id: string; token?: string };
  connectionError: boolean;
  setUser: Dispatch<SetStateAction<{ id: string; token?: string } | null>>;
  loading: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  user: null,
  connectionError: false,
  setUser: () => {},
  loading: true,
});

export const SocketContextProvider = ({ children }: PropsWithChildren) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [user, setUser] = useState<{ id: string; token?: string } | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    if (!socket && session.data?.user.id) {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WSS_URL as string);
      ws.onopen = () => {
        setSocket(ws);
        setUser(session.data?.user || null);
        setLoading(false);
      };

      ws.onclose = () => {
        setSocket(null);
        setLoading(false);
      };

      ws.onerror = () => {
        setSocket(null);
        setConnectionError(true);
        setLoading(false);
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
        setUser,
        loading,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const { socket, user, setUser, connectionError, loading } =
    useContext(SocketContext);

  const sendMessage = (type: string, data: { [key: string]: any }) => {
    socket?.send(
      JSON.stringify({
        type,
        data: {
          ...data,
          token: user?.token,
        },
      })
    );
  };

  return { socket, loading, setUser, sendMessage, user, connectionError };
};
