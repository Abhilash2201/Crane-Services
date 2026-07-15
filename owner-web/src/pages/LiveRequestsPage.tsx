import { ExternalLink, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { AppDataTable, type ColumnDef } from "../components/ui/datatable";
import { api } from "../lib/api";

const sid = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

type Request = {
  id: string;
  ref_id?: string;
  customer_name: string;
  customer_id: string;
  pickup_address: string;
  variant_name: string;
  required_capacity_tons: number | null;
  scheduled_at: string | null;
  notes: string | null;
  distance: number | null;
};

const ReqIdCell = ({ id, refId }: { id: string; refId?: string }) => (
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
    {refId ?? `REQ-${sid(id)}`}
  </span>
);

const AddressCell = ({ address }: { address: string }) => (
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
      {address || "—"}
    </span>
  </span>
);

function DetailRow({ label, value }: { label: string; value: string }) {
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
      <span style={{ color: "#0A2540", fontWeight: 600, textAlign: "right" }}>
        {value}
      </span>
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

export function LiveRequestsPage() {
  const [variant, setVariant] = useState("All");
  const [distance, setDistance] = useState("25");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Request | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    api
      .get("/owner/incoming-requests")
      .then((res) => setRequests(res.data?.data || []))
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to load requests.")
      )
      .finally(() => setLoading(false));
  }, []);

  const variantOptions = useMemo(() => {
    const labels = requests
      .map((r) => r.variant_name)
      .filter((v): v is string => Boolean(v));
    return ["All", ...Array.from(new Set(labels))];
  }, [requests]);

  const filtered = useMemo(
    () =>
      requests.filter(
        (r) =>
          (variant === "All" || r.variant_name === variant) &&
          (!r.distance || r.distance <= Number(distance))
      ),
    [variant, distance, requests]
  );

  const columns: ColumnDef<Request>[] = [
    {
      field: "id",
      header: "Request ID",
      body: (row) => <ReqIdCell id={row.id} refId={row.ref_id} />,
      width: "120px",
    },
    {
      field: "customer_name",
      header: "Customer",
      sortable: true,
    },
    {
      field: "pickup_address",
      header: "Pickup Address",
      body: (row) => <AddressCell address={row.pickup_address} />,
    },
    {
      field: "variant_name",
      header: "Variant",
      sortable: true,
      width: "140px",
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
    {
      field: "distance",
      header: "Distance",
      sortable: true,
      body: (row) => (row.distance != null ? `${row.distance} km` : "—"),
      align: "center",
      width: "90px",
    },
  ];

  const filtersSlot = (
    <>
      <select
        value={variant}
        onChange={(e) => setVariant(e.target.value)}
        style={filterSelectStyle}
        aria-label="Filter by variant"
      >
        {variantOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 12, color: "#64748B", whiteSpace: "nowrap" }}>Within</span>
        <input
          type="number"
          value={distance}
          min={1}
          onChange={(e) => setDistance(e.target.value.replace(/\D/g, ""))}
          style={{ ...filterSelectStyle, width: 70 }}
          aria-label="Max distance in km"
        />
        <span style={{ fontSize: 12, color: "#64748B" }}>km</span>
      </div>
    </>
  );

  const handleAccept = () => {
    if (!selected || accepting) return;
    setAccepting(true);
    setError("");
    api
      .post("/owner/accept-request", { requestId: selected.id })
      .then(() => {
        setRequests((prev) => prev.filter((r) => r.id !== selected.id));
        setSelected(null);
      })
      .catch((err) =>
        setError(err?.response?.data?.message || "Unable to accept request.")
      )
      .finally(() => setAccepting(false));
  };

  const navUrl = selected?.pickup_address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        selected.pickup_address
      )}`
    : null;

  const sidebarHeader = selected ? (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <ReqIdCell id={selected.id} refId={selected.ref_id} />
      <Badge variant="warning">Pending</Badge>
    </div>
  ) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}

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
          onRowClick={setSelected}
          searchable
          searchPlaceholder="Search customer, address, variant..."
          searchFields={["customer_name", "pickup_address", "variant_name"]}
          filters={filtersSlot}
          emptyMessage="No pending requests match your filters."
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
            <section>
              <DetailRow
                label="Customer"
                value={
                  selected.customer_name || `#${sid(selected.customer_id)}`
                }
              />
              <DetailRow
                label="Variant"
                value={selected.variant_name || "—"}
              />
              <DetailRow
                label="Required Capacity"
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
              {selected.distance != null ? (
                <DetailRow
                  label="Distance"
                  value={`${selected.distance} km away`}
                />
              ) : null}
              {selected.notes ? (
                <DetailRow label="Notes" value={selected.notes} />
              ) : null}
            </section>

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
                  style={{
                    fontWeight: 600,
                    color: "#0A2540",
                    fontSize: 14,
                    lineHeight: 1.4,
                  }}
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
                    <ExternalLink size={11} />
                    Open in Google Maps
                  </a>
                ) : null}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
              <Button
                size="lg"
                style={{ width: "100%" }}
                disabled={accepting}
                onClick={handleAccept}
              >
                {accepting ? "Accepting..." : "Accept Request"}
              </Button>
            </div>
          </div>
        ) : null}
      </Sidebar>
    </div>
  );
}
