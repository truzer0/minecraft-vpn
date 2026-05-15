import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body: any = { email, password };
    if (isRegister) body.username = username;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/profile';
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white/5 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-2xl text-white mb-6">
          {isRegister ? 'Регистрация' : 'Вход'}
        </h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-3 text-white"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-3 text-white"
            required
          />
          
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-full px-4 py-3 text-white"
            required
          />
          
          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-full font-medium hover:bg-white/90"
          >
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
        
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="w-full text-white/50 text-sm mt-4 hover:text-white"
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </div>
    </div>
  );
}
