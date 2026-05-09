import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import HomePage from "@/react-app/pages/Home";
import MinecraftPage from "@/react-app/pages/Minecraft";
import VPNPage from "@/react-app/pages/VPN";
import ProfilePage from "@/react-app/pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/minecraft" element={<MinecraftPage />} />
          <Route path="/vpn" element={<VPNPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}