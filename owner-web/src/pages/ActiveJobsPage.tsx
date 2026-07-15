import { ExternalLink, MapPin, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { AppDataTable, type ColumnDef } from "../components/ui/datatable";
import { createRealtimeSocket } from "../lib/realtime";
import { api } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

type Job = {
  id: string;
  ref_id?: string;
  request_id: string;
  request_ref_id?: string;
  status: string;
  pickup_address: string;
  driver_id: string | null;
  driver_name: string | null;
  crane_registration: string | null;
};

type PanelMode = "idle" | "reassign" | "cancel";

function statusVariant(status: string): "warning" | "success" | "danger" | "default" {
  if (status === "working" || status === "en_route") return "warning";
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

const JobIdPill = ({ id, refId }: { id: string; refId?: string }) => (
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
    {refId ?? `JOB-${sid(id)}`}
  </span>
);

const CranePill = ({ reg }: { reg: string | null }) =>
  reg ? (
    <span
      style={{
        background: "#FFF7ED",
        color: "#9A3412",
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 700,
        fontFamily: "monospace",
        textTransform: "uppercase",
      }}
    >
      {reg}
    </span>
  ) : (
    <span style={{ color: "#94A3B8" }}>—</span>
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

const filterSelectStyle: React.CSSProperties = {
  minHeight: 40,
  border: "1px solid #CBD5E1",
  borderRadius: 10,
  padding: "0 10px",
  background: "#fff",
  fontSize: 14,
  color: "#0f172a",
};

export function ActiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [fleet, setFleet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveEvents, setLiveEvents] = useState<string[]>([]);

  const [selected, setSelected] = useState<Job | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [panelMode, setPanelMode] = useState<PanelMode>("idle");
  const [driverChoice, setDriverChoice] = useState("");
  const [craneChoice, setCraneChoice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // keep selected in sync with live job updates
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  useEffect(() => {
    const socket = createRealtimeSocket();

    socket.on("dispatch:job_assigned", (payload: any) => {
      setLiveEvents((prev) =>
        [`Driver assigned: ${payload.ref_id ?? `JOB-${sid(payload.request_id || payload.id)}`}`, ...prev].slice(0, 5)
      );
      setJobs((prev) =>
        prev.map((j) =>
          j.request_id === (payload.request_id || payload.id)
            ? { ...j, driver_id: payload.driver_id, crane_registration: payload.crane_registration }
            : j
        )
      );
    });

    socket.on("job:status_changed", (payload: any) => {
      setLiveEvents((prev) =>
        [`${payload.refId ?? `JOB-${sid(payload.jobId)}`} → ${payload.status}`, ...prev].slice(0, 5)
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === payload.jobId ? { ...j, status: payload.status } : j))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // sync sidebar's selected job when jobs state changes (live updates)
  useEffect(() => {
    const cur = selectedRef.current;
    if (!cur) return;
    const latest = jobs.find((j) => j.id === cur.id);
    if (latest && latest !== cur) setSelected(latest);
  }, [jobs]);

  useEffect(() => {
    Promise.all([
      api.get("/owner/jobs"),
      api.get("/owner/drivers"),
      api.get("/owner/fleet"),
    ])
      .then(([jobRes, driverRes, fleetRes]) => {
        setJobs(jobRes.data?.data || []);
        setDrivers(driverRes.data?.data || []);
        setFleet(fleetRes.data?.data || []);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load jobs.")
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

  const fleetOptions = useMemo(
    () =>
      fleet.map((f: any) => ({
        registration: f.registration,
        label: `${f.name} (${f.registration || "no reg"})`,
      })),
    [fleet]
  );

  const filtered = useMemo(
    () =>
      statusFilter === "All"
        ? jobs
        : jobs.filter((j) => j.status === statusFilter),
    [jobs, statusFilter]
  );

  const handleOpenRow = (job: Job) => {
    setSelected(job);
    setPanelMode("idle");
    setDriverChoice("");
    setCraneChoice("");
    setError("");
  };

  const handleReassign = async () => {
    if (!selected || !driverChoice || !craneChoice) {
      setError("Select both a driver and a crane.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await api.post("/owner/assign-driver", {
        requestId: selected.request_id,
        driverId: driverChoice,
        craneRegistration: craneChoice,
      });
      const driverName = drivers.find((d) => d.id === driverChoice)?.name || "";
      setJobs((prev) =>
        prev.map((j) =>
          j.id === selected.id
            ? { ...j, driver_id: driverChoice, crane_registration: craneChoice, driver_name: driverName }
            : j
        )
      );
      setPanelMode("idle");
      setDriverChoice("");
      setCraneChoice("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to reassign driver.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError("");
    try {
      await api.patch(`/owner/jobs/${selected.id}/cancel`);
      setJobs((prev) =>
        prev.map((j) => (j.id === selected.id ? { ...j, status: "cancelled" } : j))
      );
      setPanelMode("idle");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to cancel job.");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<Job>[] = [
    {
      field: "id",
      header: "Job ID",
      body: (row) => <JobIdPill id={row.id} refId={row.ref_id} />,
      width: "110px",
    },
    {
      field: "pickup_address",
      header: "Pickup Address",
      body: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <MapPin size={12} style={{ color: "#FF6200", flexShrink: 0 }} />
          <span
            style={{
              maxWidth: 220,
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
      field: "driver_name",
      header: "Driver",
      sortable: true,
      body: (row) => (
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <UserRound size={12} style={{ color: "#64748B" }} />
          {row.driver_name || <span style={{ color: "#94A3B8" }}>Unassigned</span>}
        </span>
      ),
    },
    {
      field: "crane_registration",
      header: "Crane",
      body: (row) => <CranePill reg={row.crane_registration} />,
      width: "130px",
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status.replace(/_/g, " ")}
        </Badge>
      ),
      width: "130px",
    },
  ];

  const filtersSlot = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      style={filterSelectStyle}
      aria-label="Filter by status"
    >
      <option value="All">All Statuses</option>
      <option value="assigned">Assigned</option>
      <option value="en_route">En Route</option>
      <option value="working">Working</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );

  const navUrl = selected?.pickup_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        selected.pickup_address
      )}`
    : null;

  const isAssigned = selected?.status === "assigned";

  const sidebarHeader = selected ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <JobIdPill id={selected.id} refId={selected.ref_id} />
      <Badge variant={statusVariant(selected.status)}>
        {selected.status.replace(/_/g, " ")}
      </Badge>
    </div>
  ) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

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
          data={filtered}
          columns={columns}
          loading={loading}
          onRowClick={handleOpenRow}
          searchable
          searchPlaceholder="Search address or driver..."
          searchFields={["pickup_address", "driver_name", "crane_registration"]}
          filters={filtersSlot}
          emptyMessage="No jobs match the selected filter."
          pageSize={15}
        />
      </div>

      <Sidebar
        visible={Boolean(selected)}
        onHide={() => { setSelected(null); setPanelMode("idle"); }}
        position="right"
        style={{ width: "min(460px, 100vw)" }}
        header={sidebarHeader}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 20, padding: "4px 0" }}>
            {/* Details */}
            <section>
              <DetailRow
                label="Driver"
                value={
                  selected.driver_name ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <UserRound size={13} />
                      {selected.driver_name}
                    </span>
                  ) : (
                    <span style={{ color: "#94A3B8" }}>Unassigned</span>
                  )
                }
              />
              <DetailRow label="Crane" value={<CranePill reg={selected.crane_registration} />} />
              <DetailRow
                label="Status"
                value={
                  <Badge variant={statusVariant(selected.status)}>
                    {selected.status.replace(/_/g, " ")}
                  </Badge>
                }
              />
            </section>

            {/* Address card */}
            <div
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <MapPin
                size={16}
                style={{ color: "#FF6200", marginTop: 2, flexShrink: 0 }}
              />
              <div>
                <div
                  style={{ fontWeight: 600, color: "#0A2540", fontSize: 14, lineHeight: 1.4 }}
                >
                  {selected.pickup_address || "Address not provided"}
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
                      marginTop: 6,
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={11} /> Open in Google Maps
                  </a>
                ) : null}
              </div>
            </div>

            {/* Primary action */}
            <Link to={`/tracking/${selected.request_id}`} style={{ textDecoration: "none" }}>
              <Button variant="outline" style={{ width: "100%" }}>
                Open Live Tracking
              </Button>
            </Link>

            {/* Reassign / Cancel — only for assigned jobs */}
            {isAssigned && panelMode === "idle" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="outline"
                  style={{ flex: 1 }}
                  onClick={() => setPanelMode("reassign")}
                >
                  Reassign Driver
                </Button>
                <Button
                  variant="outline"
                  style={{ flex: 1, color: "#DC2626", borderColor: "#FECDD3" }}
                  onClick={() => setPanelMode("cancel")}
                >
                  Cancel Job
                </Button>
              </div>
            ) : null}

            {/* Reassign panel */}
            {panelMode === "reassign" ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  background: "#F8FAFC",
                  borderRadius: 10,
                  border: "1px solid #E2E8F0",
                }}
              >
                <strong style={{ fontSize: 13, color: "#0A2540" }}>Reassign Driver</strong>
                <select
                  value={driverChoice}
                  onChange={(e) => setDriverChoice(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">Select new driver</option>
                  {driverOptions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  value={craneChoice}
                  onChange={(e) => setCraneChoice(e.target.value)}
                  style={filterSelectStyle}
                >
                  <option value="">Select crane</option>
                  {fleetOptions.map((f) => (
                    <option key={f.registration || f.label} value={f.registration || ""}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    style={{ flex: 1 }}
                    disabled={actionLoading}
                    onClick={handleReassign}
                  >
                    {actionLoading ? "Saving..." : "Confirm Reassign"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPanelMode("idle")}
                    disabled={actionLoading}
                  >
                    Back
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Cancel panel */}
            {panelMode === "cancel" ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  padding: 14,
                  background: "#FFF1F2",
                  borderRadius: 10,
                  border: "1px solid #FECDD3",
                }}
              >
                <strong style={{ fontSize: 13, color: "#9F1239" }}>Cancel this job?</strong>
                <small style={{ color: "#64748B", lineHeight: 1.5 }}>
                  This will mark the job as cancelled and notify the driver. Only
                  possible while the driver hasn't started moving.
                </small>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    variant="outline"
                    style={{ flex: 1, color: "#DC2626", borderColor: "#FECDD3" }}
                    disabled={actionLoading}
                    onClick={handleCancel}
                  >
                    {actionLoading ? "Cancelling..." : "Yes, Cancel Job"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPanelMode("idle")}
                    disabled={actionLoading}
                  >
                    Keep Job
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Sidebar>
    </div>
  );
}
