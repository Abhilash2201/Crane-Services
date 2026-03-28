import { useEffect } from "react";
import type { Job } from "../types";

type SocketType = {
  emit: (event: string, payload: any) => void;
};

type Params = {
  socket: SocketType | null;
  active?: Job;
  online: boolean;
  isOffline: boolean;
  gpsPosition: [number, number];
  hasGps: boolean;
  onTrackingSent?: () => void;
};

const isUuid = (value?: string) =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );

export function useTrackingEmitter({
  socket,
  active,
  online,
  isOffline,
  gpsPosition,
  hasGps,
  onTrackingSent,
}: Params) {
  useEffect(() => {
    if (!socket) return;
    if (!online || isOffline) return;
    if (!active) return;
    if (!hasGps) return;

    const jobId = active.jobId;
    if (!isUuid(jobId)) return;

    const timer = setInterval(() => {
      const [lat, lng] = gpsPosition;
      // Emit real GPS coordinates only when the job is active.
      socket.emit("tracking:update", {
        jobId,
        latitude: lat,
        longitude: lng,
        speedKmph: 25 + Math.random() * 20,
        heading: Math.round(Math.random() * 360),
      });
      onTrackingSent?.();
    }, 15000);

    return () => clearInterval(timer);
  }, [
    socket,
    active,
    online,
    isOffline,
    gpsPosition,
    hasGps,
    onTrackingSent,
  ]);
}
