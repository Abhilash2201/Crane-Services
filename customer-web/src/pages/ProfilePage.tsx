import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
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
          setForm({
            name: next.name || "",
            email: next.email || "",
            phone: next.phone || "",
          });
        }
      })
      .catch(() => {
        // Fallback to local auth values.
        setForm({
          name: auth?.user?.name || "",
          email: auth?.user?.email || "",
          phone: auth?.user?.phone || "",
        });
      })
      .finally(() => setLoading(false));
  }, [auth?.user?.email, auth?.user?.name, auth?.user?.phone]);

  const user = useMemo(() => auth?.user, [auth?.user]);

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
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
          user: {
            ...auth?.user,
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            phone: updated.phone,
          },
        };
        localStorage.setItem("auth", JSON.stringify(nextAuth));
        window.dispatchEvent(new Event("auth-changed"));
        setAuth(nextAuth);
      }
      toast.success("Profile updated.");
      setEditing(false);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to update profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 680 }}>
      <h1 style={{ margin: 0 }}>Profile</h1>
      <Card>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#0f172a",
                display: "grid",
                placeItems: "center",
                color: "#fff",
              }}
            >
              <User size={18} />
            </div>
            <div>
              <strong style={{ fontSize: 18 }}>
                {form.name || user?.name || "Customer"}
              </strong>
              <div style={{ color: "#64748B" }}>
                {form.email || user?.email || "No email on file"}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <small style={{ color: "#64748B" }}>Role</small>
              <div>
                <Badge>{user?.role || "customer"}</Badge>
              </div>
            </div>
            <div>
              <small style={{ color: "#64748B" }}>Phone</small>
              <div>{form.phone || user?.phone || "—"}</div>
            </div>
            <div>
              <small style={{ color: "#64748B" }}>User ID</small>
              <div>{user?.id || "—"}</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button
                variant="outline"
                onClick={() => setEditing((prev) => !prev)}
              >
                {editing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <h3 style={{ margin: 0 }}>Edit Profile</h3>
            <label>Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
            <label>Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="you@company.com"
            />
            <label>Phone</label>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  phone: e.target.value.replace(/[^\d+]/g, "").slice(0, 16),
                }))
              }
              placeholder="98XXXXXXXX"
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button onClick={handleSave} disabled={saving || loading}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
