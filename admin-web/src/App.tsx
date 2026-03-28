import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { ManageUsersPage } from "./pages/ManageUsersPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { VariantsPage } from "./pages/VariantsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { DisputesPage } from "./pages/DisputesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./hooks/useAuth";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const auth = useAuth();
  const isAdmin = auth?.user?.role === "admin";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          isAdmin ? (
            <AdminLayout collapsed={collapsed} setCollapsed={setCollapsed} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<OverviewPage />} />
        <Route path="/users" element={<ManageUsersPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/variants" element={<VariantsPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={isAdmin ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
