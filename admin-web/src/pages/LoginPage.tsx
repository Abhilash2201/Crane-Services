import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { api, authStore } from "../lib/api";

const Wrap = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f8fafc;
  padding: 24px;
`;

const Panel = styled(Card)`
  width: min(420px, 100%);
`;

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  return (
    <Wrap>
      <Panel>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 10 }}>
          <form
            style={{ display: "grid", gap: 10 }}
            onSubmit={(e) => {
              e.preventDefault();
              setMessage("");
              if (!email.trim()) {
                setMessage("Enter your admin email.");
                return;
              }
              if (!password || password.length < 6) {
                setMessage("Password must be at least 6 characters.");
                return;
              }
              api
                .post("/auth/login", {
                  email: email.trim().toLowerCase(),
                  password,
                })
                .then((res) => {
                  const data = res.data?.data;
                  if (!data?.user) {
                    setMessage("Login failed.");
                    return;
                  }
                  if (data.user.role !== "admin") {
                    setMessage("This account is not an admin.");
                    return;
                  }
                  authStore.write(data);
                  navigate("/", { replace: true });
                })
                .catch((err) =>
                  setMessage(
                    err?.response?.data?.message || "Login failed.",
                  ),
                );
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span>Email</span>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>Password</span>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    paddingRight: 36,
                    borderColor: password && password.length < 6 ? "#DC2626" : undefined,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "grid",
                    placeItems: "center",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && password.length < 6 && (
                <small style={{ color: "#DC2626" }}>
                  Password must be at least 6 characters.
                </small>
              )}
            </label>
            <Button type="submit">Sign In</Button>
            {message ? (
              <small style={{ color: message.includes("failed") ? "#DC2626" : "#0A2540" }}>
                {message}
              </small>
            ) : null}
          </form>
        </CardContent>
      </Panel>
    </Wrap>
  );
}
