import { Link } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Gamepad2, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        {/* Hero */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-light text-white mb-6 tracking-tight">
            Nexus
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
            Единая платформа для игр и безопасного доступа в интернет
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Minecraft Card */}
          <Link
            to="/minecraft"
            className="group glass rounded-xl p-8 text-left transition-all hover:bg-white/5 hover:border-white/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(160, 224, 171, 0.3), rgba(160, 224, 171, 0.1))'
                }}
              >
                <Gamepad2 className="w-6 h-6 text-[rgb(160,224,171)]" />
              </div>
              <h2 className="text-white text-xl font-medium">Minecraft</h2>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Скачай лаунчер и присоединяйся к нашему серверу. Играй с друзьями без ограничений.
            </p>
            <div className="flex items-center gap-2 text-white/70 text-sm group-hover:text-white transition-colors">
              <span>Перейти</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* VPN Card */}
          <Link
            to="/vpn"
            className="group glass rounded-xl p-8 text-left transition-all hover:bg-white/5 hover:border-white/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 172, 46, 0.3), rgba(255, 172, 46, 0.1))'
                }}
              >
                <Shield className="w-6 h-6 text-[rgb(255,172,46)]" />
              </div>
              <h2 className="text-white text-xl font-medium">VPN</h2>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Получи профиль для VPN-клиента и пользуйся безопасным интернетом.
            </p>
            <div className="flex items-center gap-2 text-white/70 text-sm group-hover:text-white transition-colors">
              <span>Перейти</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
