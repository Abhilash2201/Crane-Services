import { Navigate, Route, Routes } from "react-router-dom";
import { CustomerLayout } from "./components/layout/CustomerLayout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { NewRequestPage } from "./pages/NewRequestPage";
import { TrackingPage } from "./pages/TrackingPage";

function App() {
  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/new-request" element={<NewRequestPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tracking/:id" element={<TrackingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CustomerLayout>
  );
}

export default App;
