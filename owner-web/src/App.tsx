import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthPage } from "./pages/AuthPage";
import { ActiveJobsPage } from "./pages/ActiveJobsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DispatchPage } from "./pages/DispatchPage";
import { DriversPage } from "./pages/DriversPage";
import { FleetPage } from "./pages/FleetPage";
import { LiveRequestsPage } from "./pages/LiveRequestsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { TrackingPage } from "./pages/TrackingPage";
import React from "react";

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
    return <Navigate to="/auth" replace />;
  }
  return children;
}

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/live-requests"
          element={
            <RequireAuth>
              <LiveRequestsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/fleet"
          element={
            <RequireAuth>
              <FleetPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dispatch"
          element={
            <RequireAuth>
              <DispatchPage />
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
          path="/active-jobs"
          element={
            <RequireAuth>
              <ActiveJobsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/drivers"
          element={
            <RequireAuth>
              <DriversPage />
            </RequireAuth>
          }
        />
        <Route
          path="/reports"
          element={
            <RequireAuth>
              <ReportsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
