import { LogIn } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, authStore } from "../lib/api";

const Wrap = styled.div`max-width: 500px; margin: 20px auto;`;

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });
      authStore.write(res.data?.data || null);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <CardHeader>
          <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogIn size={18} /> Owner Login
          </CardTitle>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <label>Email</label>
          <Input
            type="email"
            placeholder="owner@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label>Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button size="lg" onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
          <small style={{ color: "#64748B" }}>
            By continuing, you agree to CraneHub Terms & Privacy.
          </small>
          {error ? <small style={{ color: "#DC2626" }}>{error}</small> : null}
        </CardContent>
      </Card>
    </Wrap>
  );
}
