import { Link, useLocation } from "react-router";
import { User, Gamepad2, Shield } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: "/minecraft", label: "Minecraft", icon: Gamepad2 },
    { path: "/vpn", label: "VPN", icon: Shield },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Atmospheric gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(160, 224, 171, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 80% 70%, rgba(165, 45, 37, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255, 172, 46, 0.15) 0%, transparent 50%)
            `
          }}
        />
        {/* Floating orbs */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(160, 224, 171, 0.4) 0%, transparent 70%)',
            top: '-200px',
            left: '-100px',
            animation: 'float 20s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 172, 46, 0.4) 0%, transparent 70%)',
            bottom: '-150px',
            right: '-100px',
            animation: 'float 25s ease-in-out infinite reverse'
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-[1078px] mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="text-white text-2xl font-semibold tracking-tight">
              Nexus
            </Link>

            <div className="flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    isActive(item.path) 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  isActive('/profile')
                    ? 'bg-white/10 border-white/30 text-white'
                    : 'border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Профиль</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 pt-24 min-h-screen">
        <div className="max-w-[1078px] mx-auto px-6 pb-12">
          {children}
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(0) translateX(20px); }
          75% { transform: translateY(20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}
