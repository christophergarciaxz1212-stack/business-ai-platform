import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../stores/auth';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth({ user: data.user, tenant: data.tenant, accessToken: data.accessToken });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Falha no registro');
    } finally { setLoading(false); }
  };

  const field = (key, icon, type, placeholder, label) => (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <div className="relative">
        {React.createElement(icon, { className: 'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]' })}
        <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} required
          className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-colors" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl mx-auto mb-4">J</div>
          <h1 className="text-2xl font-bold">Criar sua conta</h1>
          <p className="text-[#a3a3a3] text-sm mt-1">Comece a atender clientes com IA</p>
        </div>
        <form onSubmit={submit} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4">
          {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
          {field('name', User, 'text', 'Seu nome', 'Nome')}
          {field('email', Mail, 'email', 'seu@email.com', 'Email')}
          {field('password', Lock, 'password', '••••••••', 'Senha')}
          {field('companyName', Building2, 'text', 'Nome da empresa', 'Empresa')}
          <button disabled={loading} className="w-full bg-white text-black font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Criar conta <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
        <p className="text-center text-sm text-[#a3a3a3] mt-4">
          Já tem conta? <Link to="/login" className="text-white hover:underline">Entrar</Link>
        </p>
      </motion.div>
    </div>
  );
}