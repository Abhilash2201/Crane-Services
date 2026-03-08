import { io, type Socket } from "socket.io-client";

const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8080";

export function createRealtimeSocket(token?: string): Socket {
  return io(baseUrl, {
    transports: ["websocket"],
    autoConnect: true,
    auth: token ? { token } : {}
  });
}
