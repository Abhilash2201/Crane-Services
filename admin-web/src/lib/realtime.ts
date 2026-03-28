import { io, type Socket } from "socket.io-client";

const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8080/api";
const baseUrl = rawBase.replace(/\/api\/?$/, "");

export function createRealtimeSocket(token?: string): Socket {
  return io(baseUrl, {
    transports: ["websocket"],
    autoConnect: true,
    auth: token ? { token } : {},
  });
}
