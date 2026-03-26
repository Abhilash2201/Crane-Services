import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { NewRequestPage } from "./pages/NewRequestPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TrackingPage } from "./pages/TrackingPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  let isAuthed = false;
  try {
    const raw = localStorage.getItem("auth");
    const parsed = raw ? JSON.parse(raw) : null;
    isAuthed = Boolean(parsed?.refreshToken);
  } catch {
    isAuthed = false;
  }

  if (!isAuthed) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
}

function App() {
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/new-request" element={<NewRequestPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tracking/:id"
          element={
            <RequireAuth>
              <TrackingPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomerLayout>
  );
}

export default App;
