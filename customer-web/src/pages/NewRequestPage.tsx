import { Camera, CalendarClock, Filter, MapPinned, MoveRight, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Tabs } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { api } from "../lib/api";

const craneOptions = [
  { name: "25T Mobile", type: "Mobile", capacity: 25, radius: "12m", city: "Bengaluru" },
  { name: "50T Rough Terrain", type: "Rough Terrain", capacity: 50, radius: "18m", city: "Mumbai" },
  { name: "100T Crawler", type: "Crawler", capacity: 100, radius: "28m", city: "Delhi" },
  { name: "Tower Crane", type: "Tower", capacity: 80, radius: "60m", city: "Mumbai" },
  { name: "80T All Terrain", type: "Mobile", capacity: 80, radius: "24m", city: "Delhi" }
];

const Wizard = styled.div`display: grid; gap: 14px;`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;`;

export function NewRequestPage() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedCrane, setSelectedCrane] = useState("50T Rough Terrain");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("");
  const [loadDescription, setLoadDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const filtered = useMemo(() => (selectedType === "All" ? craneOptions : craneOptions.filter((item) => item.type === selectedType)), [selectedType]);
  const selectedCraneData = useMemo(
    () => craneOptions.find((item) => item.name === selectedCrane) || craneOptions[0],
    [selectedCrane]
  );

  const handleSubmit = () => {
    let isAuthed = false;
    let accessToken: string | undefined;
    try {
      const raw = localStorage.getItem("auth");
      const parsed = raw ? JSON.parse(raw) : null;
      isAuthed = Boolean(parsed?.refreshToken);
      accessToken = parsed?.accessToken;
    } catch {
      isAuthed = false;
    }

    if (!isAuthed) {
      toast.error("Please login or sign up to submit your request.");
      navigate("/auth?mode=login&next=/new-request");
      return;
    }

    if (!pickupAddress.trim() || pickupAddress.trim().length < 5) {
      toast.error("Please enter a valid pickup address.");
      return;
    }
    if (!accessToken) {
      toast.error("Session expired. Please login again.");
      navigate("/auth?mode=login&next=/new-request");
      return;
    }

    const payload = {
      pickupAddress: pickupAddress.trim(),
      dropAddress: dropAddress.trim() || undefined,
      requiredCapacityTons: selectedCraneData?.capacity,
      scheduledAt: scheduledAt || undefined,
      notes: [
        loadDescription ? `Load: ${loadDescription}` : null,
        duration ? `Duration: ${duration}` : null,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter(Boolean)
        .join(" | ") || undefined,
    };

    setSubmitting(true);
    api
      .post("/customer/requests", payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        toast.success("Request submitted. We will confirm shortly.");
        navigate("/dashboard");
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to submit request. Please try again.",
        );
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Wizard>
      <h1>New Crane Request</h1>
      <Tabs options={["Step 1: Variant", "Step 2: Job", "Step 3: Review"]} value={`Step ${step}: ${step === 1 ? "Variant" : step === 2 ? "Job" : "Review"}`} onChange={(v) => setStep(Number(v[5]))} />

      {step === 1 && (
        <Card><CardContent style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <Badge variant="outline"><Filter size={14} /> Filters</Badge>
            <Input placeholder="Capacity 10-200T" style={{ maxWidth: 180 }} />
            <Tabs options={["All", "Mobile", "Crawler", "Tower", "Rough Terrain"]} value={selectedType} onChange={setSelectedType} />
            <Input placeholder="Radius (e.g. 20m)" style={{ maxWidth: 160 }} />
          </div>
          <Grid>
            {filtered.map((crane) => (
              <Card key={crane.name} onClick={() => setSelectedCrane(crane.name)} style={{ cursor: "pointer", borderColor: selectedCrane === crane.name ? "#FF6200" : undefined }}>
                <CardContent>
                  <h3 style={{ marginTop: 0 }}>{crane.name}</h3>
                  <p style={{ color: "#64748B" }}>{`${crane.capacity}T | ${crane.type} | ${crane.radius}`}</p>
                  <Badge>{crane.city}</Badge>
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Button size="lg" onClick={() => setStep(2)}>Continue to Job Details <MoveRight size={16} /></Button>
        </CardContent></Card>
      )}

      {step === 2 && (
        <Card><CardContent style={{ display: "grid", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Job Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <div>
              <label><MapPinned size={14} /> Job Location (Google Maps Picker)</label>
              <div style={{ marginTop: 6, height: 140, borderRadius: 12, border: "1px solid #E2E8F0", display: "grid", placeItems: "center", background: "linear-gradient(120deg,#dbeafe,#f1f5f9)" }}>
                Map picker placeholder
              </div>
              <Input
                placeholder="Pickup address"
                style={{ marginTop: 8 }}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
              />
              <Input
                placeholder="Drop address (optional)"
                style={{ marginTop: 8 }}
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
              />
            </div>
            <div>
              <label><CalendarClock size={14} /> Date & Time</label>
              <Input
                type="datetime-local"
                style={{ marginTop: 6 }}
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <label style={{ display: "block", marginTop: 10 }}>Duration</label>
              <Input
                placeholder="8 hours"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>
          <label>Load Description</label>
          <Input
            placeholder="Lift 22-ton DG unit to rooftop (18m radius)"
            value={loadDescription}
            onChange={(e) => setLoadDescription(e.target.value)}
          />
          <label>Special Instructions</label>
          <Textarea
            placeholder="Night shift entry gate is gate 3. Operator must carry PPE kit."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <label><Camera size={14} /> Site Photo Upload</label>
          <Button variant="outline"><UploadCloud size={16} /> Upload Photos</Button>
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
            <p><b>Variant:</b> {selectedCrane}</p>
            <p><b>Pickup:</b> {pickupAddress || "-"}</p>
            <p><b>Drop:</b> {dropAddress || "-"}</p>
            <p><b>Schedule:</b> {scheduledAt || "-"}</p>
            <p><b>Duration:</b> {duration || "-"}</p>
            <p><b>Expected Budget:</b> ?38,000 - ?52,000</p>
          </CardContent></Card>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" onClick={() => setStep(2)}>Edit Details</Button>
            <Button size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </CardContent></Card>
      )}
    </Wizard>
  );
}
