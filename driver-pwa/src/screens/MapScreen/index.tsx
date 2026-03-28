import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Job } from "../../types";
import { driverIcon } from "../../lib/leaflet";
import { ScreenWithNav } from "../../components/ScreenWithNav";
import { Card, SafeArea } from "../../styles/shared";
import { MapWrap } from "./styles";

type Props = {
  online: boolean;
  isOffline: boolean;
  active?: Job;
  position: [number, number];
  hasLocation: boolean;
};

export function MapScreen({
  online,
  isOffline,
  active,
  position,
  hasLocation,
}: Props) {
  const [autoCenter, setAutoCenter] = useState(true);

  const FlyToPosition = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      if (!autoCenter) return;
      map.setView(center, map.getZoom(), { animate: true });
    }, [center, map, autoCenter]);
    return null;
  };

  const MapInteractionWatcher = () => {
    useMapEvents({
      dragstart() {
        setAutoCenter(false);
      },
      zoomstart() {
        setAutoCenter(false);
      },
    });
    return null;
  };

  return (
    <ScreenWithNav active="map">
      <SafeArea>
        <Card>
          <strong>Live map</strong>
          <MapWrap>
            <MapContainer
              center={position}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FlyToPosition center={position} />
              <MapInteractionWatcher />
              <Marker position={position} icon={driverIcon} />
            </MapContainer>
          </MapWrap>
          <small style={{ color: "#64748B" }}>
            {hasLocation
              ? "Live driver location"
              : "Location unavailable. Enable GPS permissions."}
          </small>
        </Card>
        <small style={{ color: "#64748B" }}>
          Status:{" "}
          {online && !isOffline
            ? "Online & tracking active"
            : "Offline - map updates paused"}
        </small>
        {active ? (
          <Card>
            <strong>Active job</strong>
            <p style={{ margin: "6px 0", color: "#334155" }}>
              {active.id} | {active.variant}
            </p>
            <small style={{ color: "#64748B" }}>
              {active.location || "Location pending"}
            </small>
          </Card>
        ) : null}
      </SafeArea>
    </ScreenWithNav>
  );
}
