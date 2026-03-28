import { useEffect, useState } from "react";
import { api, authStore } from "../lib/api";

type AuthPayload = ReturnType<typeof authStore.read>;

export function useAuth() {
  const [auth, setAuth] = useState<AuthPayload>(() => authStore.read());

  useEffect(() => {
    const onChange = () => setAuth(authStore.read());
    window.addEventListener("auth-changed", onChange);
    return () => window.removeEventListener("auth-changed", onChange);
  }, []);

  useEffect(() => {
    if (!auth?.accessToken) return;
    if (auth.user?.role) return;

    api
      .get("/auth/me")
      .then((res) => {
        const data = res.data?.data;
        if (!data) return;
        authStore.write({
          ...(auth || {}),
          user: {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          },
        });
      })
      .catch(() => {});
  }, [auth]);

  return auth;
}
