import { useState, useEffect } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { Shield, Copy, Check, Download, ExternalLink, Globe, Gamepad2, Zap, Send, Smartphone, Monitor, Router, Key } from "lucide-react";

export default function VPNPage() {
  const { user } = useAuth();
  const [vpnProfile, setVpnProfile] = useState<any>(null);
  const [tgProxy, setTgProxy] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [vpnRes, tgRes] = await Promise.all([
        fetch('/api/vpn/profile', { headers }),
        fetch('/api/vpn/telegram-proxy', { headers })
      ]);

      setVpnProfile(await vpnRes.json());
      setTgProxy(await tgRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white/50">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-24 text-center">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-6" />
          <h1 className="text-3xl font-light text-white mb-4">Требуется авторизация</h1>
          <p className="text-white/50">Войдите для доступа к VPN</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" 
               style={{ background: 'linear-gradient(135deg, rgba(255, 172, 46, 0.3), rgba(255, 172, 46, 0.1))' }}>
            <Shield className="w-10 h-10 text-[rgb(255,172,46)]" />
          </div>
          <h1 className="text-4xl font-light text-white mb-4">VPN & Прокси</h1>
          <p className="text-white/50 text-lg">Умный VPN с обходом блокировок и прокси для Telegram</p>
        </div>

        {/* Карточки фич */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {icon: Globe, title: "Зарубежные сайты", desc: "Через Европу", color: "text-blue-400"},
            {icon: Shield, title: "РФ сайты", desc: "Напрямую", color: "text-green-400"},
            {icon: Send, title: "Telegram", desc: "Персональный прокси", color: "text-sky-400"},
            {icon: Gamepad2, title: "Игры", desc: "Без VPN", color: "text-purple-400"}
          ].map((f,i) => (
            <div key={i} className="glass rounded-xl p-4 text-center">
              <f.icon className={`w-6 h-6 ${f.color} mx-auto mb-2`} />
              <div className="text-white text-sm font-medium">{f.title}</div>
              <div className="text-white/40 text-xs">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Telegram Proxy */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-white text-lg">Telegram Прокси</h3>
              <p className="text-white/40 text-xs">Твой персональный прокси для Telegram</p>
            </div>
          </div>

          {tgProxy?.tg_link ? (
            <div className="space-y-3">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <div className="text-white/50 text-xs mb-2">Данные для подключения:</div>
                <div className="text-white/70 text-sm space-y-1">
                  <div>🔗 Сервер: <span className="text-white">{tgProxy.server}</span></div>
                  <div>🔌 Порт: <span className="text-white">{tgProxy.port}</span></div>
                  <div>🔑 Секрет: <span className="text-white text-xs break-all">{tgProxy.secret}</span></div>
                </div>
              </div>

              <a href={tgProxy.tg_link} target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-3 rounded-full font-medium hover:bg-sky-600 transition-colors">
                <Send className="w-4 h-4" />
                Подключить в Telegram
              </a>

              <button 
                onClick={() => copyToClipboard(tgProxy.tg_link, 'tg')}
                className="w-full flex items-center justify-center gap-2 border border-white/20 text-white/70 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors">
                {copiedLink === 'tg' ? <><Check className="w-4 h-4" /> Скопировано</> : <><Copy className="w-4 h-4" /> Копировать ссылку</>}
              </button>
            </div>
          ) : (
            <div className="text-white/30 text-sm">Загрузка прокси...</div>
          )}
        </div>

        {/* VPN Profile */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white text-lg">VPN Профиль</h3>
              <p className="text-white/40 text-xs">VLESS Reality протокол</p>
            </div>
          </div>

          {vpnProfile?.vpn_link ? (
            <div className="space-y-3">
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <code className="text-white/70 text-sm break-all">{vpnProfile.vpn_link}</code>
              </div>

              <button 
                onClick={() => copyToClipboard(vpnProfile.vpn_link, 'vpn')}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-full font-medium hover:bg-green-600 transition-colors">
                {copiedLink === 'vpn' ? <><Check className="w-4 h-4" /> Скопировано</> : <><Copy className="w-4 h-4" /> Копировать VPN ссылку</>}
              </button>
            </div>
          ) : (
            <div className="text-white/30 text-sm">Загрузка VPN профиля...</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
