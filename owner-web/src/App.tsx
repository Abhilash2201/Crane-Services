import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { AuthPage } from "./pages/AuthPage";
import { ActiveJobsPage } from "./pages/ActiveJobsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DriversPage } from "./pages/DriversPage";
import { FleetPage } from "./pages/FleetPage";
import { LiveRequestsPage } from "./pages/LiveRequestsPage";
import { ReportsPage } from "./pages/ReportsPage";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/live-requests" element={<LiveRequestsPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/active-jobs" element={<ActiveJobsPage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
