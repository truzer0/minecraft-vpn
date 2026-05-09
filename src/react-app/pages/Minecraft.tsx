import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { 
  Download, Copy, Check, Server, Gamepad2, 
  Users, Activity, Clock, Link, Unlink,
  Shield, Zap, Heart, Star
} from "lucide-react";

interface MinecraftProfile {
  minecraft_username: string;
  minecraft_uuid: string;
  is_premium: boolean;
  last_login_at: string;
  is_online: boolean;
  play_time: number;
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
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [minecraftUsername, setMinecraftUsername] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copiedIP, setCopiedIP] = useState(false);
  
  const serverIP = "85.215.132.23";
  const launcherUrl = "https://tlauncher.org/installer";

  useEffect(() => {
    if (user) {
      fetchMinecraftProfile();
      fetchServerStats();
    } else {
      setLoading(false);
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
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ 
          minecraft_username: minecraftUsername,
          minecraft_uuid: null // Будет установлен при первом входе
        }),
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
          <p className="text-white/50">
            Войди в аккаунт чтобы получить доступ к Minecraft серверу
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(160, 224, 171, 0.3), rgba(160, 224, 171, 0.1))'
            }}
          >
            <Gamepad2 className="w-10 h-10 text-[rgb(160,224,171)]" />
          </div>
          <h1 className="text-4xl font-light text-white mb-4">Minecraft Сервер</h1>
          <p className="text-white/50 text-lg">
            Присоединяйся к нашему серверу с модами
          </p>
        </div>

        {/* Server Stats */}
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
              <div className="text-white text-xl font-medium">
                {Math.round(stats.total_hours_played)}
              </div>
              <div className="text-white/50 text-xs">Часов игры</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-white text-xl font-medium">20.0</div>
              <div className="text-white/50 text-xs">TPS</div>
            </div>
          </div>
        )}

        {/* Account Linking */}
        {!profile ? (
          <div className="glass rounded-xl p-8 mb-6 text-center">
            <Link className="w-12 h-12 text-[rgb(160,224,171)] mx-auto mb-4" />
            <h2 className="text-2xl text-white mb-4">Привяжи Minecraft аккаунт</h2>
            <p className="text-white/50 mb-6">
              Привяжи свой никнейм чтобы получить доступ к серверу
            </p>
            
            {showLinkModal ? (
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Введи свой никнейм в Minecraft"
                  value={minecraftUsername}
                  onChange={(e) => setMinecraftUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleLinkAccount}
                    disabled={!minecraftUsername || linking}
                    className="flex-1 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {linking ? "Привязка..." : "Привязать"}
                  </button>
                  <button
                    onClick={() => setShowLinkModal(false)}
                    className="border border-white/20 text-white/70 px-6 py-3 rounded-full hover:border-white/40"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLinkModal(true)}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                <Link className="w-4 h-4" />
                Привязать аккаунт
              </button>
            )}
          </div>
        ) : (
          /* Linked Account Info */
          <div className="glass rounded-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgba(160,224,171,0.3)] to-[rgba(160,224,171,0.1)] flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-[rgb(160,224,171)]" />
                </div>
                <div>
                  <h3 className="text-xl text-white font-medium">
                    {profile.minecraft_username}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${profile.is_online ? 'bg-green-400' : 'bg-white/30'}`} />
                    <span className="text-white/50 text-sm">
                      {profile.is_online ? 'В игре' : 'Не в игре'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(true)}
                className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
              >
                <Unlink className="w-4 h-4" />
                <span className="text-sm">Отвязать</span>
              </button>
            </div>

            {/* Stats */}
            {profile.play_time > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-white text-lg font-medium">
                    {Math.round(profile.play_time / 60)}ч
                  </div>
                  <div className="text-white/50 text-xs">В игре</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-lg font-medium">
                    {profile.last_login_at ? 'Сегодня' : '-'}
                  </div>
                  <div className="text-white/50 text-xs">Последний вход</div>
                </div>
                <div className="text-center">
                  <div className="text-white text-lg font-medium">
                    {profile.is_premium ? 'Premium' : 'Cracked'}
                  </div>
                  <div className="text-white/50 text-xs">Тип аккаунта</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Server Connection Info */}
        <div className="space-y-6">
          {/* Step 1: Download */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">Скачай лаунчер с модами</h3>
                <p className="text-white/50 text-sm mb-4">
                  Мы используем Forge с оптимизирующими модами для лучшей производительности
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open("https://tlauncher.org/installer", "_blank")}
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Скачать TLauncher
                  </button>
                  {profile && (
                    <button
                      onClick={() => window.open("/mods/nexus-modpack.zip", "_blank")}
                      className="inline-flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Сборка модов
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Server IP */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">Подключись к серверу</h3>
                <p className="text-white/50 text-sm mb-4">
                  IP-адрес для подключения (после привязки аккаунта)
                </p>
                
                {profile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-full px-5 py-3">
                      <Server className="w-4 h-4 text-white/50" />
                      <code className="text-white font-mono">{serverIP}</code>
                    </div>
                    <button
                      onClick={copyServerIP}
                      className="flex items-center gap-2 border border-white/20 text-white/70 px-4 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors"
                    >
                      {copiedIP ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span>Скопировано</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Копировать</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4">
                    <p className="text-yellow-400/80 text-sm">
                      ⚠️ Сначала привяжи свой Minecraft аккаунт выше
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 3: Installed Mods */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-white/70 text-sm font-medium">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">Установленные моды</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { name: "Sodium", desc: "Оптимизация графики", icon: "🚀" },
                    { name: "Lithium", desc: "Оптимизация сервера", icon: "⚡" },
                    { name: "JourneyMap", desc: "Мини-карта", icon: "🗺️" },
                    { name: "JEI", desc: "Рецепты крафта", icon: "📖" },
                    { name: "Xaero's Minimap", desc: "Миникарта", icon: "🧭" },
                    { name: "FTB Essentials", desc: "Телепорты и дом", icon: "🏠" },
                  ].map((mod, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{mod.icon}</span>
                        <span className="text-white text-sm">{mod.name}</span>
                      </div>
                      <p className="text-white/50 text-xs">{mod.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}