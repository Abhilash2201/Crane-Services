import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, authStore } from "../../lib/api";
import { Action, Card, Input, SafeArea } from "../../styles/shared";

type Props = {
  onLogin: (auth: { user: any }) => void;
};

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  return (
    <SafeArea>
      <h2 style={{ margin: "2px 0 0", color: "#0A2540" }}>Driver Login</h2>
      <small style={{ color: "#64748B" }}>CraneHub Operator Access</small>
      <Card>
        <label>Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Action
          style={{ marginTop: 10 }}
          onClick={() => {
            setMessage("");
            if (!email.trim()) {
              setMessage("Enter your email.");
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
                authStore.write(res.data?.data || null);
                onLogin(res.data?.data || {});
                navigate("/home");
              })
              .catch((err) =>
                setMessage(
                  err?.response?.data?.message || "Login failed. Try again.",
                ),
              );
          }}
        >
          Login
        </Action>
      </Card>
      <small
        style={{ color: message.includes("Invalid") ? "#b91c1c" : "#334155" }}
      >
        {message}
      </small>
    </SafeArea>
  );
}
