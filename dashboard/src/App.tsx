import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AppointmentsPage from "./pages/AppointmentsPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import FaqPage from "./pages/FaqPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<AppointmentsPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
