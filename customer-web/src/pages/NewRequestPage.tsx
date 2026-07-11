import { Camera, CalendarClock, Filter, MapPinned, MoveRight, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
const SuggestionList = styled.ul`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 4px;
  margin: 0;
  list-style: none;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1);
  max-height: 220px;
  overflow-y: auto;
`;
const SuggestionItem = styled.li`
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #0f172a;
  line-height: 1.4;
  &:hover { background: #F1F5F9; }
`;
const StickyBar = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: 76px;
  left: 50%;
  transform: translateX(-50%) translateY(${({ $visible }) => ($visible ? "0" : "16px")});
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 45;
  background: #0a2540;
  color: #fff;
  border-radius: 16px;
  padding: 10px 12px 10px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.25);
  width: calc(100vw - 32px);
  max-width: 540px;
  @media (min-width: 900px) {
    bottom: 28px;
  }
`;

export function NewRequestPage() {
  const [step, setStep] = useState(1);
  const [variants, setVariants] = useState<CraneVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(true);
  const [capacityFilter, setCapacityFilter] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [pricing, setPricing] = useState<{ base_charge: number; base_hours: number; overtime_rate: number } | null>(null);
  const [loadDescription, setLoadDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pickupTouched, setPickupTouched] = useState(false);
  const [scheduledAtTouched, setScheduledAtTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pickupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Google Maps refs (commented — replaced by Nominatim)
  const pickupInputRef = useRef<HTMLInputElement | null>(null);
  const dropInputRef = useRef<HTMLInputElement | null>(null);
  const pickupAutocompleteRef = useRef<any>(null);
  const dropAutocompleteRef = useRef<any>(null);
  const [mapsReady, setMapsReady] = useState(false);
  */
  const navigate = useNavigate();

  const isDurationValid = useMemo(() => {
    if (!durationHours) return true;
    const val = Number(durationHours);
    return !Number.isNaN(val) && val >= 1 && val <= 72;
  }, [durationHours]);

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

  /* Google Maps script loader + autocomplete (commented — replaced by Nominatim)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!apiKey) return;
    if ((window as any).google?.maps?.places) { setMapsReady(true); return; }
    const scriptId = "google-maps-places";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      const onLoad = () => setMapsReady(true);
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true; script.defer = true;
    const onLoad = () => setMapsReady(true);
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (!mapsReady || step !== 2) return;
    const google = (window as any).google;
    if (!google?.maps?.places) return;
    const restrictions = { country: ["in"] };
    const bounds = new google.maps.LatLngBounds({ lat: 12.7343, lng: 77.3792 }, { lat: 13.1737, lng: 77.8827 });
    if (pickupInputRef.current && !pickupAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(pickupInputRef.current, { fields: ["formatted_address"], types: ["geocode"], componentRestrictions: restrictions, bounds, strictBounds: true });
      ac.addListener("place_changed", () => { const p = ac.getPlace(); if (p?.formatted_address) setPickupAddress(p.formatted_address); });
      pickupAutocompleteRef.current = ac;
    }
    if (dropInputRef.current && !dropAutocompleteRef.current) {
      const ac = new google.maps.places.Autocomplete(dropInputRef.current, { fields: ["formatted_address"], types: ["geocode"], componentRestrictions: restrictions, bounds, strictBounds: true });
      ac.addListener("place_changed", () => { const p = ac.getPlace(); if (p?.formatted_address) setDropAddress(p.formatted_address); });
      dropAutocompleteRef.current = ac;
    }
  }, [mapsReady, step]);
  */

  const fetchNominatim = async (query: string, setter: (s: string[]) => void) => {
    if (query.trim().length < 3) { setter([]); return; }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=6&addressdetails=0`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: { display_name: string }[] = await res.json();
      setter(data.map((d) => d.display_name));
    } catch {
      setter([]);
    }
  };

  const handlePickupChange = (val: string) => {
    setPickupAddress(val);
    setPickupTouched(false);
    if (pickupTimerRef.current) clearTimeout(pickupTimerRef.current);
    pickupTimerRef.current = setTimeout(() => fetchNominatim(val, setPickupSuggestions), 400);
    setPickupOpen(true);
  };

  const handleDropChange = (val: string) => {
    setDropAddress(val);
    if (dropTimerRef.current) clearTimeout(dropTimerRef.current);
    dropTimerRef.current = setTimeout(() => fetchNominatim(val, setDropSuggestions), 400);
    setDropOpen(true);
  };

  useEffect(() => {
    const variantId = selectedVariant?.id;
    const capacityTons = selectedVariant?.capacity_tons
      ? Number(selectedVariant.capacity_tons)
      : undefined;

    api
      .get("/pricing", {
        params: variantId ? { variantId } : capacityTons ? { capacityTons } : undefined,
      })
      .then((res) => setPricing(res.data?.data || null))
      .catch(() => setPricing(null));
  }, [selectedVariant]);

  const estimatedPrice = useMemo(() => {
    if (!pricing) return null;
    const baseHours = Number(pricing.base_hours) || 3;
    const baseCharge = Number(pricing.base_charge) || 3000;
    const overtimeRate = Number(pricing.overtime_rate) || 1000;
    const hours = durationHours ? Math.ceil(Number(durationHours)) : baseHours;
    const billable = Math.max(baseHours, hours);
    const overtime = Math.max(0, billable - baseHours);
    return baseCharge + overtime * overtimeRate;
  }, [durationHours, pricing]);

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

    const normalizedScheduledAt = (() => {
      if (!scheduledAt) return undefined;
      const dt = new Date(scheduledAt);
      if (Number.isNaN(dt.getTime())) return undefined;
      return dt.toISOString();
    })();

    const payload = {
      pickupAddress: pickupAddress.trim(),
      dropAddress: dropAddress.trim() || undefined,
      variantId: selectedVariant?.id || undefined,
      requiredCapacityTons: selectedVariant?.capacity_tons
        ? Number(selectedVariant.capacity_tons)
        : undefined,
      durationHours: durationHours ? Number(durationHours) : undefined,
      scheduledAt: normalizedScheduledAt,
      notes: [
        loadDescription ? `Load: ${loadDescription}` : null,
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
      .then(async (res) => {
        const requestId = res.data?.data?.id;
        if (requestId && photos.length) {
          const form = new FormData();
          photos.forEach((file) => form.append("photos", file));
          setUploading(true);
          try {
            await api.post(`/customer/requests/${requestId}/photos`, form, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "multipart/form-data",
              },
            });
          } catch (error) {
            const message =
              (error as any)?.response?.data?.message ||
              "Request submitted but photo upload failed.";
            toast.error(message);
          } finally {
            setUploading(false);
          }
        }
        toast.success("Request submitted. We will confirm shortly.");
        navigate("/dashboard");
      })
      .catch((error) => {
        toast.error(
          error?.response?.data?.message ||
            "Unable to submit request. Please try again."
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const list = event.target.files ? Array.from(event.target.files) : [];
    if (!list.length) return;
    const next = list.slice(0, 6);
    setPhotos(next);
  };

  return (
    <Wizard>
      <h1>New Crane Request</h1>
      <Tabs
        options={["Step 1: Variant", "Step 2: Job", "Step 3: Review"]}
        value={`Step ${step}: ${step === 1 ? "Variant" : step === 2 ? "Job" : "Review"}`}
        onChange={(v) => setStep(Number(v[5]))}
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
            </div>
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
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Job Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
              <div>
                <label><MapPinned size={14} /> Job Location <span style={{ color: "#DC2626" }}>*</span></label>
                <div style={{ marginTop: 6, height: 140, borderRadius: 12, border: "1px solid #E2E8F0", display: "grid", placeItems: "center", background: "linear-gradient(120deg,#dbeafe,#f1f5f9)" }}>
                  Map picker placeholder
                </div>
                <div style={{ position: "relative", marginTop: 8 }}>
                  <Input
                    placeholder="Pickup address"
                    style={{ borderColor: pickupTouched && !pickupAddress.trim() ? "#DC2626" : undefined }}
                    value={pickupAddress}
                    onChange={(e) => handlePickupChange(e.target.value)}
                    onFocus={() => setPickupOpen(true)}
                    onBlur={() => setTimeout(() => setPickupOpen(false), 150)}
                    autoComplete="off"
                  />
                  {pickupOpen && pickupSuggestions.length > 0 && (
                    <SuggestionList>
                      {pickupSuggestions.map((s, i) => (
                        <SuggestionItem
                          key={i}
                          onMouseDown={() => { setPickupAddress(s); setPickupSuggestions([]); setPickupOpen(false); setPickupTouched(false); }}
                        >
                          {s}
                        </SuggestionItem>
                      ))}
                    </SuggestionList>
                  )}
                  {pickupTouched && !pickupAddress.trim() && (
                    <small style={{ color: "#DC2626" }}>Pickup address is required.</small>
                  )}
                </div>
                <div style={{ position: "relative", marginTop: 8 }}>
                  <Input
                    placeholder="Drop address (optional)"
                    value={dropAddress}
                    onChange={(e) => handleDropChange(e.target.value)}
                    onFocus={() => setDropOpen(true)}
                    onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                    autoComplete="off"
                  />
                  {dropOpen && dropSuggestions.length > 0 && (
                    <SuggestionList>
                      {dropSuggestions.map((s, i) => (
                        <SuggestionItem
                          key={i}
                          onMouseDown={() => { setDropAddress(s); setDropSuggestions([]); setDropOpen(false); }}
                        >
                          {s}
                        </SuggestionItem>
                      ))}
                    </SuggestionList>
                  )}
                </div>
              </div>
              <div>
                <label>
                  <CalendarClock size={14} /> Date & Time <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <Input
                  type="datetime-local"
                  style={{ marginTop: 6, borderColor: scheduledAtTouched && !scheduledAt ? "#DC2626" : undefined }}
                  value={scheduledAt}
                  onChange={(e) => { setScheduledAt(e.target.value); setScheduledAtTouched(true); }}
                />
                {scheduledAtTouched && !scheduledAt && (
                  <small style={{ color: "#DC2626" }}>Date & Time is required.</small>
                )}
                <label style={{ display: "block", marginTop: 10 }}>Duration (hours)</label>
                <Input
                  placeholder="4"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value.replace(/[^\d.]/g, ""))}
                  style={{ borderColor: durationHours && !isDurationValid ? "#DC2626" : undefined }}
                />
                {durationHours && !isDurationValid && (
                  <small style={{ color: "#DC2626" }}>Enter a value between 1 and 72 hours.</small>
                )}
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              style={{ display: "none" }}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={16} /> Upload Photos
            </Button>
            {photos.length ? (
              <small style={{ color: "#64748B" }}>
                {photos.length} photo{photos.length > 1 ? "s" : ""} selected
              </small>
            ) : null}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button
                size="lg"
                onClick={() => {
                  if (!pickupAddress.trim()) { setPickupTouched(true); return; }
                  if (!scheduledAt) { setScheduledAtTouched(true); return; }
                  if (!isDurationValid) return;
                  setStep(3);
                }}
              >
                Review Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Review & Submit</h3>
            <Card>
              <CardContent>
                <p><b>Variant:</b> {selectedVariant?.name || "-"}</p>
                <p><b>Pickup:</b> {pickupAddress || "-"}</p>
                <p><b>Drop:</b> {dropAddress || "-"}</p>
                <p><b>Schedule:</b> {scheduledAt ? new Date(scheduledAt).toLocaleString() : "-"}</p>
                <p><b>Duration:</b> {durationHours ? `${durationHours} hrs` : "-"}</p>
                <p><b>Load Description:</b> {loadDescription || "-"}</p>
                <p><b>Special Instructions:</b> {notes || "-"}</p>
                <p><b>Site Photos:</b> {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} selected` : "None"}</p>
                <p>
                  <b>Estimated Price:</b>{" "}
                  {estimatedPrice ? `Rs ${estimatedPrice.toLocaleString()}` : "-"}
                </p>
                {pricing ? (
                  <small style={{ color: "#64748B" }}>
                    Pricing: Rs {pricing.base_charge} for first {pricing.base_hours} hours, then Rs {pricing.overtime_rate}/hour.
                  </small>
                ) : null}
              </CardContent>
            </Card>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" onClick={() => setStep(2)}>Edit Details</Button>
              <Button size="lg" onClick={handleSubmit} disabled={submitting || uploading}>
                {submitting || uploading ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <StickyBar $visible={step === 1 && !!selectedVariant}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedVariant?.name ?? ""}
          </div>
          {selectedVariant?.base_charge ? (
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 1 }}>
              Rs {Number(selectedVariant.base_charge).toLocaleString()} / {Number(selectedVariant.base_hours ?? 0)}h minimum
            </div>
          ) : null}
        </div>
        <Button
          size="sm"
          onClick={() => setStep(2)}
          style={{ background: "#FF6200", border: "none", color: "#fff", flexShrink: 0, whiteSpace: "nowrap" }}
        >
          Continue <MoveRight size={14} />
        </Button>
      </StickyBar>
    </Wizard>
  );
}
