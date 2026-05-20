import { Navigate, Outlet, Route, Routes } from "react-router-dom";
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

function ProtectedLayout() {
  let isAuthed = false;
  try {
    const raw = localStorage.getItem("auth");
    isAuthed = Boolean(raw ? JSON.parse(raw)?.refreshToken : false);
  } catch {}

  if (!isAuthed) return <Navigate to="/auth" replace />;

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/live-requests" element={<LiveRequestsPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/dispatch" element={<DispatchPage />} />
        <Route path="/tracking/:id" element={<TrackingPage />} />
        <Route path="/active-jobs" element={<ActiveJobsPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
