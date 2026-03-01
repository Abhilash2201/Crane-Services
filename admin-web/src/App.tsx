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

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Routes>
      <Route element={<AdminLayout collapsed={collapsed} setCollapsed={setCollapsed} />}>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
