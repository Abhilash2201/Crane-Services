import { io, type Socket } from "socket.io-client";
import { authStore } from "./api";

const rawBase =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8080/api";
const baseUrl = rawBase.replace(/\/api\/?$/, "");

export function createRealtimeSocket(token?: string): Socket {
  const auth = authStore.read();
  const resolved = token || auth?.accessToken;
  return io(baseUrl, {
    transports: ["websocket"],
    autoConnect: true,
    auth: resolved ? { token: resolved } : {},
  });
}
