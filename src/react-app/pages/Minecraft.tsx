import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { 
  Download, Copy, Check, Server, Gamepad2, 
  Users, Activity, Clock, Link as LinkIcon, Unlink,
  Shield, Zap, Package as PackageIcon
} from "lucide-react";

interface MinecraftProfile {
  minecraft_username: string;
  minecraft_uuid: string;
  is_premium: boolean;
  last_login_at: string;
  is_online: boolean;
  play_time: number;
  blocks_broken?: number;
  blocks_placed?: number;
  deaths?: number;
  mobs_killed?: number;
  distance_traveled?: number;
}

interface ServerStats {
  total_players: number;
  active_today: number;
  active_week: number;
  total_hours_played: number;
  tps: string;
  players_online: string;
}

export default function MinecraftPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MinecraftProfile | null>(null);
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [linking, setLinking] = useState(false);
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copiedIP, setCopiedIP] = useState(false);
  
  const serverIP = "153.80.251.181";

  useEffect(() => {
    if (user) {
      fetchMinecraftProfile();
      fetchServerStats();
    }
  }, [user]);

  const fetchMinecraftProfile = async () => {
    try {
      const response = await fetch('/api/minecraft/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch Minecraft profile:", error);
    }
  };

  const fetchServerStats = async () => {
    try {
      const response = await fetch('/api/minecraft/server-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch server stats:", error);
    }
  };

  const handleLinkAccount = async () => {
    setLinking(true);
    try {
      const response = await fetch('/api/minecraft/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minecraft_username: minecraftUsername }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.account);
        setShowLinkModal(false);
      }
    } catch (error) {
      console.error("Failed to link account:", error);
    } finally {
      setLinking(false);
    }
  };

  const copyServerIP = () => {
    navigator.clipboard.writeText(serverIP);
    setCopiedIP(true);
    setTimeout(() => setCopiedIP(false), 2000);
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-24 text-center">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-6" />
          <h1 className="text-3xl font-light text-white mb-4">Требуется авторизация</h1>
          <p className="text-white/50">Войди в аккаунт чтобы получить доступ к Minecraft серверу</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(160, 224, 171, 0.3), rgba(160, 224, 171, 0.1))' }}>
            <Gamepad2 className="w-10 h-10 text-[rgb(160,224,171)]" />
          </div>
          <h1 className="text-4xl font-light text-white mb-4">Minecraft Сервер</h1>
          <p className="text-white/50 text-lg">Присоединяйся к нашему серверу с модами</p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-[rgb(160,224,171)] mx-auto mb-2" />
              <div className="text-white text-xl font-medium">{stats.total_players}</div>
              <div className="text-white/50 text-xs">Всего игроков</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Activity className="w-6 h-6 text-[rgb(255,172,46)] mx-auto mb-2" />
              <div className="text-white text-xl font-medium">{stats.active_week}</div>
              <div className="text-white/50 text-xs">За неделю</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-white text-xl font-medium">{Math.round(stats.total_hours_played)}</div>
              <div className="text-white/50 text-xs">Часов игры</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-xl font-medium">20.0</div>
              <div className="text-white/50 text-xs">TPS</div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">Скачай лаунчер с модами</h3>
                <p className="text-white/50 text-sm mb-4">Мы используем Forge с оптимизирующими модами</p>
                <div className="flex gap-2">
                  <a href="https://tlauncher.org/installer" target="_blank"
                     className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                    <Download className="w-4 h-4" /> Скачать TLauncher
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">Подключись к серверу</h3>
                <p className="text-white/50 text-sm mb-4">IP-адрес для подключения</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3">
                    <Server className="w-4 h-4 text-white/50" />
                    <code className="text-white font-mono">{serverIP}</code>
                  </div>
                  <button onClick={copyServerIP}
                     className="flex items-center gap-2 border border-white/20 text-white/70 px-4 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors">
                    {copiedIP ? <><Check className="w-4 h-4 text-green-400" /> Скопировано</> : <><Copy className="w-4 h-4" /> Копировать</>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-white text-lg mb-4">Установленные моды</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Sodium","Lithium","JourneyMap","JEI","Tinkers Construct","Immersive Portals","Pam's HarvestCraft","TerraForged","BSL Shaders"].map((mod, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <span className="text-white text-sm">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
