import { useState } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { User, LogOut, Save, Mail, Lock, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, login, register, loginWithGoogle, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Смена пароля
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (isRegister) {
        await register(email, password, username);
      } else {
        await login(email, password);
      }
      window.location.reload();
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Минимум 6 символов");
      return;
    }

    setPasswordLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Пароль успешно изменён!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.error || 'Ошибка');
      }
    } catch {
      setPasswordError("Ошибка сети");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><div className="text-white/50">Загрузка...</div></div></Layout>;
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto pt-24">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, rgba(165, 45, 37, 0.3), rgba(165, 45, 37, 0.1))' }}>
              <User className="w-10 h-10 text-[rgb(165,45,37)]" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2">
              {isRegister ? 'Регистрация' : 'Вход'}
            </h2>
            <p className="text-white/50 text-sm">Войдите для доступа к сервисам</p>
          </div>

          <div className="glass rounded-xl p-6 mb-4">
            {authError && (
              <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{authError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="block text-white/50 text-xs mb-1">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                      placeholder="Ваше имя" required />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-white/50 text-xs mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                    placeholder="email@example.com" required />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1">Пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                    placeholder="••••••" minLength={6} required />
                </div>
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full bg-white text-black py-2.5 rounded-full text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors">
                {authLoading ? 'Подождите...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
              </button>
            </form>
            <button onClick={() => { setIsRegister(!isRegister); setAuthError(""); }}
              className="w-full text-white/50 text-xs mt-3 hover:text-white transition-colors">
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs">или</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <button onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a6.8 6.8 0 01-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77A4.73 4.73 0 0112 18.6c-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11.99 11.99 0 0012 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.9 11.9 0 001 12c0 2.07.43 4.03 1.18 5.79l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11.97 11.97 0 0012 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </div>
      </Layout>
    );
  }

  // Авторизован
  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-12">
        {/* Профиль */}
        <div className="glass rounded-xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center">
              <User className="w-10 h-10 text-white/50" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">{user.username || user.name || 'Пользователь'}</h1>
              <p className="text-white/50 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Смена пароля */}
        <div className="glass rounded-xl p-6 mb-6">
          <button 
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors w-full text-left"
          >
            <Key className="w-5 h-5" />
            <span className="text-lg">🔒 Сменить пароль</span>
            <span className="ml-auto text-white/50 text-sm">{showChangePassword ? '▲' : '▼'}</span>
          </button>

          {showChangePassword && (
            <div className="mt-4 space-y-3">
              {passwordError && (
                <div className="bg-red-500/20 text-red-400 p-3 rounded-lg text-sm">{passwordError}</div>
              )}
              {passwordSuccess && (
                <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm">{passwordSuccess}</div>
              )}
              
              <div>
                <label className="block text-white/50 text-xs mb-1">Текущий пароль</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                    placeholder="••••••" />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">Новый пароль</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                    placeholder="Минимум 6 символов" minLength={6} />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-1">Повторите пароль</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                    placeholder="••••••" minLength={6} />
                </div>
              </div>

              <button onClick={handleChangePassword} disabled={passwordLoading}
                className="w-full bg-[rgb(165,45,37)] text-white py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors">
                {passwordLoading ? 'Сохранение...' : 'Сменить пароль'}
              </button>
            </div>
          )}
        </div>

        {/* Ссылки на сервисы */}
        <a href="/minecraft" className="block glass rounded-xl p-4 mb-3 hover:bg-white/5 transition-colors">
          <div className="text-white">🎮 Minecraft сервер</div>
          <div className="text-white/40 text-xs">Подключиться к серверу</div>
        </a>

        <a href="/vpn" className="block glass rounded-xl p-4 mb-6 hover:bg-white/5 transition-colors">
          <div className="text-white">🔐 VPN</div>
          <div className="text-white/40 text-xs">Получить доступ к VPN</div>
        </a>

        <button onClick={logout} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <LogOut className="w-4 h-4" /><span>Выйти</span>
        </button>
      </div>
    </Layout>
  );
}
