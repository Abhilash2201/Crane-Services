import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";

type AuthPayload = {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    phone?: string | null;
  };
};

export function ProfilePage() {
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth");
      setAuth(raw ? (JSON.parse(raw) as AuthPayload) : null);
    } catch {
      setAuth(null);
    }
  }, []);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const next = res.data?.data;
        if (next) {
          setForm({ name: next.name || "", email: next.email || "", phone: next.phone || "" });
        }
      })
      .catch(() => {
        setForm({
          name: auth?.user?.name || "",
          email: auth?.user?.email || "",
          phone: auth?.user?.phone || "",
        });
      })
      .finally(() => setLoading(false));
  }, [auth?.user?.email, auth?.user?.name, auth?.user?.phone]);

  const user = useMemo(() => auth?.user, [auth?.user]);

  const isPhoneValid = useMemo(
    () => !form.phone || /^[6-9]\d{9}$/.test(form.phone),
    [form.phone],
  );

  const initials = (form.name || user?.name || "?")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) { toast.error("Name is required."); return; }
    if (!isPhoneValid) { toast.error("Enter a valid 10-digit mobile number."); return; }

    setSaving(true);
    try {
      const res = await api.put("/auth/me", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || undefined,
      });
      const updated = res.data?.data;
      if (updated) {
        const nextAuth: AuthPayload = {
          ...(auth || {}),
          user: { ...auth?.user, id: updated.id, name: updated.name, email: updated.email, role: updated.role, phone: updated.phone },
        };
        localStorage.setItem("auth", JSON.stringify(nextAuth));
        window.dispatchEvent(new Event("auth-changed"));
        setAuth(nextAuth);
      }
      toast.success("Profile updated.");
      setEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    api.get("/auth/me").then((res) => {
      const next = res.data?.data;
      if (next) setForm({ name: next.name || "", email: next.email || "", phone: next.phone || "" });
    }).catch(() => {});
    setEditing(false);
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 540 }}>
      <h1 style={{ margin: 0 }}>Profile</h1>

      <Card>
        <CardContent style={{ display: "grid", gap: 20 }}>

          {/* Avatar + identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#0f172a", color: "#fff",
              display: "grid", placeItems: "center",
              fontWeight: 700, fontSize: 20, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{form.name || user?.name || "Customer"}</div>
              <div style={{ color: "#64748B", fontSize: 14 }}>{form.email || user?.email}</div>
              <div style={{ marginTop: 6 }}><Badge>{user?.role || "customer"}</Badge></div>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #E2E8F0", margin: 0 }} />

          {!editing ? (
            /* ── View mode ── */
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <small style={{ color: "#64748B" }}>Phone</small>
                  <div style={{ marginTop: 2, fontWeight: 500 }}>{form.phone || "—"}</div>
                </div>
                <div>
                  <small style={{ color: "#64748B" }}>Email</small>
                  <div style={{ marginTop: 2, fontWeight: 500 }}>{form.email || "—"}</div>
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  disabled={loading}
                  style={{ width: "fit-content" }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          ) : (
            /* ── Edit mode ── */
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 4 }}>
                  Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4 }}>Email</label>
                <div style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  background: "#F8FAFC",
                  color: "#64748B",
                  fontSize: "0.95rem",
                }}>
                  {form.email}
                </div>
                <small style={{ color: "#94a3b8" }}>Email cannot be changed as it is used for login.</small>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: 4 }}>Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                  placeholder="98XXXXXXXX"
                  style={{ borderColor: form.phone && !isPhoneValid ? "#DC2626" : undefined }}
                />
                {form.phone && !isPhoneValid && (
                  <small style={{ color: "#DC2626" }}>Must be a valid 10-digit number starting with 6–9.</small>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
