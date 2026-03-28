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
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  return (
    <Wrap>
      <Panel>
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent style={{ display: "grid", gap: 10 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button
            onClick={() => {
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
            Sign In
          </Button>
          {message ? (
            <small style={{ color: message.includes("failed") ? "#DC2626" : "#0A2540" }}>
              {message}
            </small>
          ) : null}
        </CardContent>
      </Panel>
    </Wrap>
  );
}
