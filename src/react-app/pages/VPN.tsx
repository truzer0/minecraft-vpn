import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { 
  Shield, Copy, Check, Download, ExternalLink, 
  Smartphone, Monitor, Router, Zap, Globe, 
  Gamepad2, Send, MessageCircle, ArrowRight,
  AlertCircle, Info, ChevronDown, Wifi, WifiOff,
  Server, Cpu, HardDrive, Activity
} from "lucide-react";

interface VpnProfile {
  id: string;
  profile_url: string;
  protocol: string;
  configuration: {
    uuid: string;
    address: string;
    port: number;
    type: string;
    security: string;
    sni: string;
  };
  stats: {
    upload: number;
    download: number;
    total: number;
    enabled: boolean;
  };
  links: {
    vless: string;
    trojan: string;
    clash: string;
    singbox: string;
    outline: string;
  };
}

export default function VPNPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VpnProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState("");
  const [activeTab, setActiveTab] = useState("vless");
  const [showTelegramProxy, setShowTelegramProxy] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [telegramProxyType, setTelegramProxyType] = useState<'mtproto' | 'socks5' | 'http'>('mtproto');

  useEffect(() => {
    if (user) {
      fetchVPNProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVPNProfile = async () => {
    try {
      const response = await fetch('/api/vpn/profile');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch VPN profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  const downloadConfig = async (type: string) => {
    try {
      const response = await fetch(`/api/vpn/config/${type}`);
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-vpn-${type}.${type === 'clash' ? 'yaml' : 'txt'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Генерация прокси для Telegram
  const getTelegramProxy = (type: 'mtproto' | 'socks5' | 'http') => {
    const serverIP = profile?.configuration.address || '85.215.132.23';
    const proxySecret = profile?.configuration.uuid?.substring(0, 32) || crypto.randomUUID().substring(0, 32);
    
    switch (type) {
      case 'mtproto':
        return {
          link: `https://t.me/proxy?server=${serverIP}&port=443&secret=${proxySecret}`,
          config: `tg://proxy?server=${serverIP}&port=443&secret=${proxySecret}`,
          manual: `Server: ${serverIP}\nPort: 443\nSecret: ${proxySecret}`
        };
      case 'socks5':
        return {
          link: `https://t.me/socks?server=${serverIP}&port=1080`,
          config: `tg://socks?server=${serverIP}&port=1080`,
          manual: `Server: ${serverIP}\nPort: 1080\nType: SOCKS5`
        };
      case 'http':
        return {
          link: `https://t.me/proxy?server=${serverIP}&port=8080`,
          config: `tg://proxy?server=${serverIP}&port=8080`,
          manual: `Server: ${serverIP}\nPort: 8080\nType: HTTP`
        };
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-24 text-center">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-6" />
          <h1 className="text-3xl font-light text-white mb-4">Требуется авторизация</h1>
          <p className="text-white/50">
            Войди в аккаунт чтобы получить доступ к VPN
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div 
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 172, 46, 0.3), rgba(255, 172, 46, 0.1))'
            }}
          >
            <Shield className="w-10 h-10 text-[rgb(255,172,46)]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-light text-white mb-4">VPN</h1>
          <p className="text-white/50 text-lg">
            Умный VPN с обходом блокировок и игровой оптимизацией
          </p>
        </div>

        {/* Quick Actions - Telegram Proxy + VPN Profile */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Telegram Proxy Card */}
          <div className="glass rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Send className="w-full h-full text-blue-400" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">Telegram Прокси</h3>
                  <p className="text-white/40 text-xs">Прямой доступ без VPN</p>
                </div>
              </div>

              <p className="text-white/60 text-sm mb-4">
                Быстрый прокси для Telegram. Работает даже при блокировках.
              </p>

              {!showTelegramProxy ? (
                <button
                  onClick={() => setShowTelegramProxy(true)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Получить прокси
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Выбор типа прокси */}
                  <div className="flex gap-2">
                    {(['mtproto', 'socks5', 'http'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTelegramProxyType(type)}
                        className={`flex-1 px-3 py-2 rounded-full text-xs transition-colors ${
                          telegramProxyType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {type === 'mtproto' ? 'MTProto' : type.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Ссылка для Telegram */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                    <code className="text-blue-400 text-xs break-all">
                      {getTelegramProxy(telegramProxyType).config}
                    </code>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={getTelegramProxy(telegramProxyType).link}
                      target="_blank"
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Открыть в Telegram
                    </a>
                    <button
                      onClick={() => copyToClipboard(getTelegramProxy(telegramProxyType).config, 'telegram')}
                      className="flex items-center gap-2 border border-white/20 text-white/70 px-4 py-2 rounded-full text-sm hover:border-white/40 transition-colors"
                    >
                      {copiedLink === 'telegram' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Ручная настройка */}
                  <details className="text-white/50 text-xs">
                    <summary className="cursor-pointer hover:text-white/70">Ручная настройка</summary>
                    <pre className="mt-2 p-2 bg-black/40 rounded-lg text-white/40">
                      {getTelegramProxy(telegramProxyType).manual}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>

          {/* VPN Profile Card */}
          <div className="glass rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Globe className="w-full h-full text-green-400" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium">VPN Профиль</h3>
                  <p className="text-white/40 text-xs">Полный доступ ко всем сайтам</p>
                </div>
              </div>

              <p className="text-white/60 text-sm mb-4">
                Получи доступ ко всем заблокированным сайтам с умной маршрутизацией.
              </p>

              {profile ? (
                <div className="space-y-3">
                  {/* Статистика */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white text-sm font-medium">
                        {formatBytes(profile.stats?.download || 0)}
                      </div>
                      <div className="text-white/40 text-xs">Скачано</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white text-sm font-medium">
                        {formatBytes(profile.stats?.upload || 0)}
                      </div>
                      <div className="text-white/40 text-xs">Загружено</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="text-white text-sm font-medium">∞</div>
                      <div className="text-white/40 text-xs">Трафик</div>
                    </div>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (profile?.links?.vless) {
                          copyToClipboard(profile.links.vless, 'vpn');
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      {copiedLink === 'vpn' ? (
                        <><Check className="w-4 h-4" /> Скопировано</>
                      ) : (
                        <><Copy className="w-4 h-4" /> Копировать ссылку</>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("vless")}
                      className="flex items-center gap-2 border border-white/20 text-white/70 px-4 py-3 rounded-full text-sm hover:border-white/40 transition-colors"
                    >
                      Настроить
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={fetchVPNProfile}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Получить профиль
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Full VPN Configuration (expanded) */}
        {profile && activeTab && (
          <div className="glass rounded-xl p-6 mb-6">
            <h3 className="text-white text-lg mb-4">Полная настройка VPN</h3>
            
            {/* Protocol Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { id: 'vless', label: 'VLESS Reality', icon: Shield, color: 'green' },
                { id: 'trojan', label: 'Trojan TLS', icon: Shield, color: 'blue' },
                { id: 'clash', label: 'Clash Meta', icon: Monitor, color: 'orange' },
                { id: 'singbox', label: 'Sing-box', icon: Router, color: 'purple' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Config Display */}
            {profile.links && profile.links[activeTab as keyof typeof profile.links] && (
              <>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
                  <code className="text-white/70 text-sm break-all">
                    {profile.links[activeTab as keyof typeof profile.links]}
                  </code>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(
                      profile.links[activeTab as keyof typeof profile.links],
                      activeTab
                    )}
                    className="flex-1 flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    {copiedLink === activeTab ? (
                      <><Check className="w-4 h-4" /> Скопировано</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Копировать</>
                    )}
                  </button>
                  
                  <button
                    onClick={() => downloadConfig(activeTab)}
                    className="flex items-center gap-2 border border-white/20 text-white/70 px-6 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Скачать файл
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Globe, title: "Зарубежные сайты", desc: "Через Европу", color: "text-blue-400" },
            { icon: Shield, title: "РФ сайты", desc: "Напрямую", color: "text-green-400" },
            { icon: Zap, title: "Telegram/Discord", desc: "Прокси/Zapret", color: "text-yellow-400" },
            { icon: Gamepad2, title: "Игры", desc: "Без VPN", color: "text-purple-400" },
          ].map((feature, i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <feature.icon className={`w-6 h-6 ${feature.color} mx-auto mb-2`} />
              <div className="text-white text-sm font-medium">{feature.title}</div>
              <div className="text-white/40 text-xs">{feature.desc}</div>
            </div>
          ))}
        </div>

        {/* Client Apps */}
        <div className="glass rounded-xl p-6 mb-6">
          <h4 className="text-white text-lg mb-4">Приложения для подключения</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon: Smartphone, name: "v2rayNG", platform: "Android", url: "#" },
              { icon: Smartphone, name: "Streisand", platform: "iOS", url: "#" },
              { icon: Monitor, name: "Nekoray", platform: "Windows", url: "#" },
              { icon: Monitor, name: "Clash Verge", platform: "Mac/Linux", url: "#" },
              { icon: Router, name: "Sing-box", platform: "Роутер", url: "#" },
            ].map((app, i) => (
              <a
                key={i}
                href={app.url}
                target="_blank"
                className="bg-white/5 rounded-lg p-3 text-center hover:bg-white/10 transition-colors"
              >
                <app.icon className="w-6 h-6 text-white/40 mx-auto mb-1" />
                <div className="text-white text-xs font-medium">{app.name}</div>
                <div className="text-white/30 text-xs">{app.platform}</div>
              </a>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="glass rounded-xl p-6">
          <button 
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full flex items-center justify-between text-white"
          >
            <h4 className="text-lg">Как работает умный роутинг</h4>
            <ChevronDown className={`w-5 h-5 transition-transform ${showInstructions ? 'rotate-180' : ''}`} />
          </button>
          
          {showInstructions && (
            <div className="mt-4 space-y-3">
              {[
                { icon: "🇷🇺", text: "Российские сайты (Яндекс, ВК, Сбербанк) — напрямую, без VPN, твой реальный IP" },
                { icon: "🎮", text: "Игры (CS2, Dota 2, Minecraft, Valorant) — прямой IP, минимальный пинг" },
                { icon: "💬", text: "Telegram — через встроенный прокси MTProto/SOCKS5" },
                { icon: "💬", text: "Discord — через Zapret (обход DPI)" },
                { icon: "🌍", text: "Зарубежные сайты (Google, YouTube, GitHub) — через Европейский сервер" },
                { icon: "📺", text: "YouTube — обход замедления через Zapret" },
                { icon: "🤖", text: "ChatGPT/OpenAI — через Европу для стабильного доступа" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-white/70 text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}