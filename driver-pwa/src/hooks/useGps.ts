import { useEffect, useState } from "react";

export function useGps() {
  const [gpsPosition, setGpsPosition] = useState<[number, number]>([
    12.9716, 77.5946,
  ]);
  const [hasGps, setHasGps] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsPosition([pos.coords.latitude, pos.coords.longitude]);
        setHasGps(true);
      },
      () => {
        setHasGps(false);
      },
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 8000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { gpsPosition, hasGps };
}
