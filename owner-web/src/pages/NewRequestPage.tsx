import { CalendarClock, Filter, MapPinned, MoveRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";

type CraneVariant = {
  id: string;
  name: string;
  capacity_tons?: number | null;
  description?: string | null;
  base_charge?: number | null;
  base_hours?: number | null;
  overtime_rate?: number | null;
};

const Wizard = styled.div`display: grid; gap: 14px;`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;`;

export function NewRequestPage() {
  const [step, setStep] = useState(1);
  const [variants, setVariants] = useState<CraneVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestCapacity, setRequestCapacity] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestBaseCharge, setRequestBaseCharge] = useState("");
  const [requestBaseHours, setRequestBaseHours] = useState("");
  const [requestOvertimeRate, setRequestOvertimeRate] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    api
      .get("/variants", { params: { active: true } })
      .then((res) => {
        const rows = (res.data?.data || []) as CraneVariant[];
        setVariants(rows);
        if (rows.length) setSelectedVariantId(rows[0].id);
      })
      .catch(() => setVariants([]))
      .finally(() => setVariantsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const minCapacity = capacityFilter ? Number(capacityFilter) : null;
    if (!minCapacity || Number.isNaN(minCapacity)) return variants;
    return variants.filter((item) => {
      const cap = item.capacity_tons ? Number(item.capacity_tons) : null;
      return cap !== null && cap >= minCapacity;
    });
  }, [capacityFilter, variants]);

  const selectedVariant = useMemo(
    () => variants.find((item) => item.id === selectedVariantId) || null,
    [selectedVariantId, variants]
  );

  const submitVariantRequest = () => {
    setRequestMessage("");
    if (!requestName.trim()) {
      setRequestMessage("Variant name is required.");
      return;
    }

    setRequestSubmitting(true);
    api
      .post("/owner/variant-requests", {
        suggestedName: requestName.trim(),
        capacityTons: requestCapacity ? Number(requestCapacity) : undefined,
        description: requestDescription.trim() || undefined,
        expectedBaseCharge: requestBaseCharge ? Number(requestBaseCharge) : undefined,
        expectedBaseHours: requestBaseHours ? Number(requestBaseHours) : undefined,
        expectedOvertimeRate: requestOvertimeRate ? Number(requestOvertimeRate) : undefined,
      })
      .then(() => {
        setRequestMessage("Request sent to admin.");
        setRequestName("");
        setRequestCapacity("");
        setRequestDescription("");
        setRequestBaseCharge("");
        setRequestBaseHours("");
        setRequestOvertimeRate("");
      })
      .catch((error) => {
        setRequestMessage(
          error?.response?.data?.message || "Unable to submit request."
        );
      })
      .finally(() => setRequestSubmitting(false));
  };

  return (
    <Wizard>
      <h1>New Crane Request</h1>
      <Tabs
        options={["Step 1: Variant", "Step 2: Job", "Step 3: Review"]}
        value={`Step ${step}: ${step === 1 ? "Variant" : step === 2 ? "Job" : "Review"}`}
        onChange={(value) => setStep(Number(value[5]))}
      />

      {step === 1 && (
        <Card>
          <CardContent style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
              <Badge variant="outline"><Filter size={14} /> Filters</Badge>
              <Input
                placeholder="Min capacity tons"
                style={{ maxWidth: 180 }}
                value={capacityFilter}
                onChange={(event) =>
                  setCapacityFilter(event.target.value.replace(/[^\d.]/g, ""))
                }
              />
              <Button variant="outline" onClick={() => setRequestOpen((prev) => !prev)}>
                {requestOpen ? "Close Request Form" : "Request Missing Variant"}
              </Button>
            </div>

            {requestOpen ? (
              <Card>
                <CardContent style={{ display: "grid", gap: 8 }}>
                  <h3 style={{ margin: 0 }}>Request New Variant from Admin</h3>
                  <Input
                    placeholder="Variant name"
                    value={requestName}
                    onChange={(event) => setRequestName(event.target.value)}
                  />
                  <Input
                    placeholder="Capacity tons (optional)"
                    value={requestCapacity}
                    onChange={(event) =>
                      setRequestCapacity(event.target.value.replace(/[^\d.]/g, ""))
                    }
                  />
                  <Textarea
                    placeholder="Why needed or specs"
                    value={requestDescription}
                    onChange={(event) => setRequestDescription(event.target.value)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
                    <Input
                      placeholder="Expected base charge"
                      value={requestBaseCharge}
                      onChange={(event) =>
                        setRequestBaseCharge(event.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                    <Input
                      placeholder="Expected base hours"
                      value={requestBaseHours}
                      onChange={(event) =>
                        setRequestBaseHours(event.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                    <Input
                      placeholder="Expected overtime/hr"
                      value={requestOvertimeRate}
                      onChange={(event) =>
                        setRequestOvertimeRate(event.target.value.replace(/[^\d.]/g, ""))
                      }
                    />
                  </div>
                  {requestMessage ? <small>{requestMessage}</small> : null}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={submitVariantRequest} disabled={requestSubmitting}>
                      {requestSubmitting ? "Sending..." : "Send to Admin"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Grid>
              {variantsLoading ? <p>Loading variants...</p> : null}
              {!variantsLoading && filtered.length === 0 ? (
                <p>No active variants available.</p>
              ) : null}
              {filtered.map((crane) => (
                <Card
                  key={crane.id}
                  onClick={() => setSelectedVariantId(crane.id)}
                  style={{
                    cursor: "pointer",
                    borderColor: selectedVariant?.id === crane.id ? "#FF6200" : undefined,
                  }}
                >
                  <CardContent>
                    <h3 style={{ marginTop: 0 }}>{crane.name}</h3>
                    <p style={{ color: "#64748B" }}>
                      {crane.capacity_tons ? `${Number(crane.capacity_tons)}T` : "Capacity on request"}
                      {crane.description ? ` | ${crane.description}` : ""}
                    </p>
                    <Badge>
                      Rs {Number(crane.base_charge || 0)} / {Number(crane.base_hours || 0)}h
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </Grid>
            <Button size="lg" onClick={() => setStep(2)} disabled={!selectedVariant}>
              Continue to Job Details <MoveRight size={16} />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card><CardContent style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Job Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <div>
              <label><MapPinned size={14} /> Job Location (Google Maps Picker)</label>
              <div style={{ marginTop: 6, height: 140, borderRadius: 12, border: "1px solid #E2E8F0", display: "grid", placeItems: "center", background: "linear-gradient(120deg,#dbeafe,#f1f5f9)" }}>Pin: Whitefield, Bengaluru (560066)</div>
            </div>
            <div>
              <label><CalendarClock size={14} /> Date & Time</label>
              <Input type="datetime-local" style={{ marginTop: 6 }} />
              <label style={{ display: "block", marginTop: 10 }}>Duration</label>
              <Input placeholder="8 hours" />
            </div>
          </div>
          <label>Load Description</label>
          <Input placeholder="Lift 22-ton DG unit to rooftop (18m radius)" />
          <label>Special Instructions</label>
          <Textarea placeholder="Night shift entry gate is gate 3. Operator must carry PPE kit." />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button size="lg" onClick={() => setStep(3)}>Review Request</Button>
          </div>
        </CardContent></Card>
      )}

      {step === 3 && (
        <Card><CardContent style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Review & Submit</h3>
          <Card><CardContent>
            <p><b>Variant:</b> {selectedVariant?.name || "-"}</p>
            <p><b>Capacity:</b> {selectedVariant?.capacity_tons ? `${selectedVariant.capacity_tons}T` : "-"}</p>
            <p><b>Base Pricing:</b> Rs {selectedVariant?.base_charge || 0} for {selectedVariant?.base_hours || 0}h</p>
            <p><b>Overtime:</b> Rs {selectedVariant?.overtime_rate || 0}/hour</p>
          </CardContent></Card>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" onClick={() => setStep(2)}>Edit Details</Button>
            <Button size="lg">Submit Request</Button>
          </div>
        </CardContent></Card>
      )}
    </Wizard>
  );
}

