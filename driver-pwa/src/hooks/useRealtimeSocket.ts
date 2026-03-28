import { useEffect, useState } from "react";
import { createRealtimeSocket } from "../lib/realtime";

export function useRealtimeSocket() {
  const [socket, setSocket] =
    useState<ReturnType<typeof createRealtimeSocket> | null>(null);

  useEffect(() => {
    const nextSocket = createRealtimeSocket();
    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, []);

  return socket;
}
