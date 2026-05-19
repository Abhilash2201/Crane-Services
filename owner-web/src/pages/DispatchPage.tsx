import { ExternalLink, MapPin, MoveRight, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { AppDataTable, type ColumnDef } from "../components/ui/datatable";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

type Request = {
  id: string;
  customer_name: string | null;
  customer_id: string;
  pickup_address: string;
  drop_address: string | null;
  required_capacity_tons: number | null;
  scheduled_at: string | null;
  notes: string | null;
};

type FleetOption = {
  registration: string;
  label: string;
  capacity: number | null;
};

const ReqIdPill = ({ id }: { id: string }) => (
  <span
    style={{
      background: "#F1F5F9",
      color: "#475569",
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      fontFamily: "monospace",
    }}
  >
    REQ-{sid(id)}
  </span>
);

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        fontSize: 14,
        gap: 12,
        padding: "6px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <span style={{ color: "#64748B", flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#0A2540", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function WarnBanner({ message, linkTo, linkLabel }: { message: string; linkTo: string; linkLabel: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 14px",
        background: "#FFFBEB",
        border: "1px solid #FDE68A",
        borderRadius: 10,
        fontSize: 13,
        color: "#92400E",
        flexWrap: "wrap",
      }}
    >
      <span>{message}</span>
      <Link to={linkTo} style={{ textDecoration: "none" }}>
        <Button size="sm" variant="outline">{linkLabel}</Button>
      </Link>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  minHeight: 40,
  width: "100%",
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  fontSize: 14,
  color: "#0f172a",
};

export function DispatchPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  const [selected, setSelected] = useState<Request | null>(null);
  const [driverChoice, setDriverChoice] = useState("");
  const [craneChoice, setCraneChoice] = useState("");
  const [dispatching, setDispatching] = useState(false);

  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    const socket = createRealtimeSocket();

    socket.on("dispatch:job_assigned", (payload: any) => {
      const label = `REQ-${sid(payload.request_id || payload.id)} dispatched`;
      setLiveEvents((prev) => [label, ...prev].slice(0, 5));
      // remove dispatched request from list
      setRequests((prev) =>
        prev.filter((r) => r.id !== (payload.request_id || payload.id))
      );
    });

    socket.on("job:status_changed", (payload: any) => {
      setLiveEvents((prev) =>
        [`JOB-${sid(payload.jobId)} → ${payload.status}`, ...prev].slice(0, 5)
      );
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/owner/accepted-requests"),
      api.get("/owner/drivers"),
      api.get("/owner/fleet"),
    ])
      .then(([reqRes, driverRes, fleetRes]) => {
        setRequests(reqRes.data?.data || []);
        setDrivers(driverRes.data?.data || []);
        setFleet(fleetRes.data?.data || []);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load dispatch data.")
      )
      .finally(() => setLoading(false));
  }, []);

  const driverOptions = useMemo(
    () =>
      drivers.map((d: any) => ({
        id: d.id,
        label: `${d.name || "Driver"} (${d.phone || "no phone"})`,
      })),
    [drivers]
  );

  const fleetOptions: FleetOption[] = useMemo(
    () =>
      fleet.map((f: any) => ({
        registration: f.registration,
        label: `${f.name} (${f.registration || "no reg"})`,
        capacity: f.capacity_tons ? Number(f.capacity_tons) : null,
      })),
    [fleet]
  );

  const getSuggestedFleet = (requiredTons?: number | null): FleetOption[] => {
    if (!requiredTons || !fleetOptions.length) return fleetOptions;
    return [...fleetOptions].sort((a, b) => {
      const aCap = a.capacity ?? Infinity;
      const bCap = b.capacity ?? Infinity;
      const aDelta = aCap >= requiredTons ? aCap - requiredTons : Infinity;
      const bDelta = bCap >= requiredTons ? bCap - requiredTons : Infinity;
      if (aDelta !== bDelta) return aDelta - bDelta;
      return aCap - bCap;
    });
  };

  const handleOpenRow = (req: Request) => {
    setSelected(req);
    setDriverChoice("");
    setCraneChoice("");
    setError("");
  };

  const handleDispatch = async () => {
    if (!selected) return;
    if (!driverChoice || !craneChoice) {
      setError("Select both a driver and a crane before dispatching.");
      return;
    }
    setDispatching(true);
    setError("");
    try {
      await api.post("/owner/assign-driver", {
        requestId: selected.id,
        driverId: driverChoice,
        craneRegistration: craneChoice,
      });
      setRequests((prev) => prev.filter((r) => r.id !== selected.id));
      setSelected(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to dispatch.");
    } finally {
      setDispatching(false);
    }
  };

  const columns: ColumnDef<Request>[] = [
    {
      field: "id",
      header: "Request ID",
      body: (row) => <ReqIdPill id={row.id} />,
      width: "120px",
    },
    {
      field: "customer_name",
      header: "Customer",
      sortable: true,
      body: (row) =>
        row.customer_name || (
          <span style={{ color: "#94A3B8" }}>#{sid(row.customer_id)}</span>
        ),
    },
    {
      field: "pickup_address",
      header: "Pickup",
      body: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={12} style={{ color: "#FF6200", flexShrink: 0 }} />
          <span
            style={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.pickup_address || "—"}
          </span>
        </span>
      ),
    },
    {
      field: "drop_address",
      header: "Drop Off",
      body: (row) =>
        row.drop_address ? (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <MoveRight size={12} style={{ color: "#64748B", flexShrink: 0 }} />
            <span
              style={{
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {row.drop_address}
            </span>
          </span>
        ) : (
          <span style={{ color: "#94A3B8", fontSize: 12 }}>Pickup only</span>
        ),
    },
    {
      field: "required_capacity_tons",
      header: "Capacity",
      sortable: true,
      body: (row) =>
        row.required_capacity_tons ? `${row.required_capacity_tons} T` : "—",
      align: "center",
      width: "100px",
    },
    {
      field: "scheduled_at",
      header: "Scheduled",
      sortable: true,
      body: (row) =>
        row.scheduled_at
          ? new Date(row.scheduled_at).toLocaleString()
          : "ASAP",
      width: "160px",
    },
  ];

  const suggestedFleet = selected
    ? getSuggestedFleet(
        selected.required_capacity_tons
          ? Number(selected.required_capacity_tons)
          : null
      )
    : fleetOptions;

  const navUrl = selected?.pickup_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        selected.pickup_address
      )}`
    : null;

  const sidebarHeader = selected ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ReqIdPill id={selected.id} />
      <Badge variant="warning">Accepted</Badge>
    </div>
  ) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <h1 style={{ margin: "0 0 4px 0" }}>Dispatch Board</h1>
        <p style={{ margin: 0, color: "#64748B", fontSize: 14 }}>
          Select a request to assign a driver and crane for dispatch.
        </p>
      </div>

      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

      {/* Warning banners — only shown when data is missing */}
      {!loading && !drivers.length ? (
        <WarnBanner
          message="No drivers linked to your account yet."
          linkTo="/drivers"
          linkLabel="Add Drivers"
        />
      ) : null}
      {!loading && !fleet.length ? (
        <WarnBanner
          message="No cranes in your fleet yet."
          linkTo="/fleet"
          linkLabel="Add Fleet"
        />
      ) : null}

      {/* Live events compact banner */}
      {liveEvents.length ? (
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 10,
            padding: "8px 12px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 18px",
          }}
        >
          <strong style={{ fontSize: 12, color: "#0A2540", alignSelf: "center" }}>
            Live
          </strong>
          {liveEvents.map((evt) => (
            <small key={evt} style={{ color: "#334155" }}>
              {evt}
            </small>
          ))}
        </div>
      ) : null}

      <div
        style={{
          width: selected ? "calc(100% - 460px)" : "100%",
          transition: "width 0.3s ease",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <AppDataTable
          data={requests}
          columns={columns}
          loading={loading}
          onRowClick={handleOpenRow}
          searchable
          searchPlaceholder="Search customer, address..."
          searchFields={["customer_name", "pickup_address", "drop_address"]}
          emptyMessage={
            !loading && !requests.length
              ? "No accepted requests to dispatch. Accept a request from Live Requests first."
              : "No requests match your search."
          }
          pageSize={15}
        />
      </div>

      <Sidebar
        visible={Boolean(selected)}
        onHide={() => setSelected(null)}
        position="right"
        style={{ width: "min(460px, 100vw)" }}
        header={sidebarHeader}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 20, padding: "4px 0" }}>
            {/* Request details */}
            <section>
              <DetailRow
                label="Customer"
                value={
                  selected.customer_name || (
                    <span style={{ color: "#94A3B8" }}>#{sid(selected.customer_id)}</span>
                  )
                }
              />
              <DetailRow
                label="Capacity"
                value={
                  selected.required_capacity_tons
                    ? `${selected.required_capacity_tons} T`
                    : "—"
                }
              />
              <DetailRow
                label="Scheduled"
                value={
                  selected.scheduled_at
                    ? new Date(selected.scheduled_at).toLocaleString()
                    : "ASAP"
                }
              />
              {selected.notes ? (
                <DetailRow label="Notes" value={selected.notes} />
              ) : null}
            </section>

            {/* Pickup address card */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "12px 14px",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <MapPin
                  size={15}
                  style={{ color: "#FF6200", marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>
                    PICKUP
                  </div>
                  <div style={{ fontWeight: 600, color: "#0A2540", fontSize: 14, lineHeight: 1.4 }}>
                    {selected.pickup_address || "Not provided"}
                  </div>
                  {navUrl ? (
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: "#FF6200",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 4,
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={11} /> Open in Google Maps
                    </a>
                  ) : null}
                </div>
              </div>

              {selected.drop_address ? (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <MoveRight
                    size={15}
                    style={{ color: "#64748B", marginTop: 2, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 2 }}>
                      DROP OFF
                    </div>
                    <div style={{ fontWeight: 600, color: "#0A2540", fontSize: 14, lineHeight: 1.4 }}>
                      {selected.drop_address}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Dispatch form */}
            <div
              style={{
                display: "grid",
                gap: 10,
                padding: 14,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <UserRound size={15} style={{ color: "#FF6200" }} />
                <strong style={{ fontSize: 13, color: "#0A2540" }}>
                  Assign Driver & Crane
                </strong>
              </div>

              <div>
                <label
                  style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}
                >
                  Driver
                </label>
                <select
                  value={driverChoice}
                  onChange={(e) => setDriverChoice(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select driver</option>
                  {driverOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{ fontSize: 12, color: "#64748B", display: "block", marginBottom: 4 }}
                >
                  Crane
                  {selected.required_capacity_tons ? (
                    <span style={{ marginLeft: 6, color: "#FF6200" }}>
                      (sorted for {selected.required_capacity_tons}T requirement)
                    </span>
                  ) : null}
                </label>
                <select
                  value={craneChoice}
                  onChange={(e) => setCraneChoice(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select crane</option>
                  {suggestedFleet.map((f) => (
                    <option key={f.registration || f.label} value={f.registration || ""}>
                      {f.label}
                      {f.capacity ? ` • ${f.capacity}T` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                size="lg"
                style={{ width: "100%", marginTop: 4 }}
                disabled={dispatching || !driverChoice || !craneChoice}
                onClick={handleDispatch}
              >
                {dispatching ? "Dispatching..." : "Dispatch Now"}
              </Button>
            </div>

            <Link
              to={`/tracking/${selected.id}`}
              style={{ textDecoration: "none" }}
            >
              <Button variant="outline" style={{ width: "100%" }}>
                <ExternalLink size={14} />
                Open Live Tracking
              </Button>
            </Link>
          </div>
        ) : null}
      </Sidebar>
    </div>
  );
}
