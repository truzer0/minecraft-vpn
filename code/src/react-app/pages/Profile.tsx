import { useState } from "react";
import { useAuth } from "@/react-app/contexts/AuthContext";
import Layout from "@/react-app/components/Layout";
import { User, Camera, LogOut, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, login, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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
        <div className="max-w-md mx-auto pt-24 text-center">
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(165, 45, 37, 0.3), rgba(165, 45, 37, 0.1))'
            }}
          >
            <User className="w-12 h-12 text-[rgb(165,45,37)]" />
          </div>
          <h1 className="text-3xl font-light text-white mb-4">Вход в аккаунт</h1>
          <p className="text-white/50 mb-8">
            Войди, чтобы получить доступ к сервисам
          </p>
          
          <button
            onClick={login}
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </button>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-12">
        {/* Profile Header */}
        <div className="glass rounded-xl p-8 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-white/50" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-full px-4 py-2 text-white mb-2 focus:outline-none focus:border-white/30 w-full"
                  placeholder="Введи имя"
                />
              ) : (
                <h1 className="text-2xl font-medium text-white mb-1">{user.name}</h1>
              )}
              <p className="text-white/50">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-white text-lg mb-4">Настройки профиля</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-2">Имя</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
                  placeholder="Введи имя"
                />
                {isEditing ? (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Сохранение..." : "Сохранить"}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="border border-white/20 text-white/70 px-6 py-3 rounded-full text-sm hover:border-white/40 hover:text-white transition-colors"
                  >
                    Изменить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Connected Services */}
        <div className="glass rounded-xl p-6 mb-6">
          <h3 className="text-white text-lg mb-4">Подключенные сервисы</h3>
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <div className="text-white text-sm">Google</div>
              <div className="text-white/50 text-xs">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </Layout>
  );
}