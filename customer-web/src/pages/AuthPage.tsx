import { LogIn, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api } from "../lib/api";

const Wrap = styled.div`
  max-width: 500px;
  margin: 20px auto;
`;

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isEmailValid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email],
  );

  useEffect(() => {
    const nextMode = searchParams.get("mode");
    if (nextMode === "signup" || nextMode === "register") {
      setMode("register");
    } else if (nextMode === "login") {
      setMode("login");
    }
  }, [searchParams]);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/dashboard";
  }, [searchParams]);

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || "Request failed. Please try again.";
    }
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!isEmailValid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register") {
      if (!name.trim()) {
        toast.error("Please enter your name.");
        return;
      }
      if (confirmPassword !== password) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const response = await api.post("/auth/register", {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() ? phone.trim() : undefined,
          password,
          role: "customer",
        });
        localStorage.setItem("auth", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("auth-changed"));
        toast.success("Account created successfully.");
      } else {
        const response = await api.post("/auth/login", {
          email: email.trim().toLowerCase(),
          password,
        });
        localStorage.setItem("auth", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("auth-changed"));
        toast.success("Logged in successfully.");
      }
      navigate(nextPath);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrap>
      <Card>
        <CardHeader>
          <CardTitle style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {mode === "register" ? <UserPlus size={18} /> : <LogIn size={18} />}
            {mode === "register" ? "Create Account" : "Login"}
          </CardTitle>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
              style={{ flex: 1 }}
            >
              Login
            </Button>
            <Button
              variant={mode === "register" ? "default" : "outline"}
              onClick={() => setMode("register")}
              style={{ flex: 1 }}
            >
              Sign Up
            </Button>
          </div>

          {mode === "register" ? (
            <>
              <label>Full Name</label>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <label>Phone (optional)</label>
              <Input
                placeholder="98XXXXXXXX"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 15))
                }
              />
            </>
          ) : null}

          <label>Email</label>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" ? (
            <>
              <label>Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </>
          ) : null}

          <Button size="lg" onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "register"
                ? "Create Account"
                : "Login"}
          </Button>
          <small style={{ color: "#64748B" }}>
            By continuing, you agree to CraneHub Terms & Privacy.
          </small>
        </CardContent>
      </Card>
    </Wrap>
  );
}
