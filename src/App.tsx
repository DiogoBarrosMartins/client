import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import ResourcesView from "./pages/travian/Resources";
import VillageView from "./pages/travian/Village";
import MapView from "./pages/travian/Map";
import ReportsView from "./pages/travian/Reports";
import MessagesView from "./pages/travian/Messages";
import RallyPointView from "./pages/travian/RallyPoint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TravianShell from "./layout/TravianShell";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* páginas públicas apenas quando deslogado */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* jogo (protegido) */}
        <Route element={<PrivateRoute />}>
          <Route element={<TravianShell />}>
            <Route path="/resources" element={<ResourcesView />} />
            <Route path="/village" element={<VillageView />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/messages" element={<MessagesView />} />
            <Route path="/rally" element={<RallyPointView />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route path="*" element={<Navigate to="/resources" replace />} />
      </Routes>
    </AuthProvider>
  );
}
