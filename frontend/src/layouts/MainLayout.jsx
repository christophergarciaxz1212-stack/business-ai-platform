import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, Users, Bot, Cpu, Phone, BookOpen,
  BarChart3, Settings, HelpCircle, LogOut, Menu, X, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../stores/auth';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/conversations', icon: MessageSquare, label: 'Conversas' },
  { to: '/customers', icon: Users, label: 'Clientes' },
  { to: '/ai-agent', icon: Bot, label: 'Atendente IA' },
  { to: '/ai-models', icon: Cpu, label: 'Modelos de IA' },
  { to: '/whatsapp', icon: Phone, label: 'WhatsApp' },
  { to: '/knowledge', icon: BookOpen, label: 'Base de conhecimento' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
  { to: '/help', icon: HelpCircle, label: 'Ajuda' },
];

export default function MainLayout() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#262626] bg-[#0f0f0f] p-4">
        <Brand />
        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((item) => (
            <NavItem key={item.to} item={item} />
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#a3a3a3] hover:text-white hover:bg-[#1c1c1c] transition-colors">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-64 h-full bg-[#0f0f0f] border-r border-[#262626] p-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <Brand />
                <button onClick={() => setOpen(false)} className="text-[#a3a3a3] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex-1 space-y-1">
                {NAV.map((item) => (
                  <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden text-[#a3a3a3] hover:text-white" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
            <Sparkles className="w-4 h-4" />
            <span>JARVIS BUSINESS AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Sistema ativo
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg">J</div>
      <div>
        <div className="font-bold text-sm leading-tight">JARVIS</div>
        <div className="text-[10px] text-[#a3a3a3] leading-tight">Business AI</div>
      </div>
    </div>
  );
}

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
          isActive
            ? 'bg-white text-black font-medium shadow-lg shadow-white/5'
            : 'text-[#a3a3a3] hover:text-white hover:bg-[#1c1c1c]'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {item.label}
    </NavLink>
  );
}