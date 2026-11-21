import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Bot, Clock, TrendingUp, Activity } from 'lucide-react';
import api from '../lib/api';

const Stat = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-[#141414] border border-[#262626] rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-[#a3a3a3]">{label}</span>
      <Icon className="w-4 h-4 text-[#a3a3a3]" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {hint && <div className="text-xs text-[#a3a3a3] mt-1">{hint}</div>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({ conversations: 0, customers: 0, messages: 0, pending: 0, transferred: 0, avgResponse: '—' });

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-[#a3a3a3] mt-1">Visão geral do seu atendimento</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat icon={MessageSquare} label="Conversas" value={stats.conversations} />
        <Stat icon={Users} label="Clientes atendidos" value={stats.customers} />
        <Stat icon={Activity} label="Mensagens recebidas" value={stats.messages} />
        <Stat icon={Clock} label="Pendentes" value={stats.pending} />
        <Stat icon={TrendingUp} label="Transferidas para humano" value={stats.transferred} />
        <Stat icon={Bot} label="Tempo médio de resposta" value={stats.avgResponse} />
      </div>
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Atividade recente</h3>
        <div className="text-sm text-[#a3a3a3]">Nenhuma atividade ainda. Conecte seu WhatsApp e ative o atendente.</div>
      </div>
    </div>
  );
}