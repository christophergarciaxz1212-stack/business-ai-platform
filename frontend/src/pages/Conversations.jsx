import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, User, Bot, Hand } from 'lucide-react';
import api from '../lib/api';

export default function Conversations() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    api.get('/conversations').then((r) => setList(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/conversations/${selected.id}/messages`).then((r) => setMessages(r.data || [])).catch(() => {});
  }, [selected]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    await api.post(`/conversations/${selected.id}/messages`, { content: input, role: 'agent' }).catch(() => {});
    setInput('');
    api.get(`/conversations/${selected.id}/messages`).then((r) => setMessages(r.data || [])).catch(() => {});
  };

  const takeover = async () => {
    if (!selected) return;
    await api.post(`/conversations/${selected.id}/takeover`).catch(() => {});
    setSelected({ ...selected, humanTakeover: true });
  };

  const filtered = list.filter((c) => (c.customer?.name || c.customer?.phone || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <div className="w-full md:w-80 bg-[#141414] border border-[#262626] rounded-2xl flex flex-col">
        <div className="p-3 border-b border-[#262626]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#a3a3a3]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar conversas..."
              className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-white/40" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 && <div className="p-4 text-sm text-[#a3a3a3]">Nenhuma conversa.</div>}
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`w-full text-left p-3 border-b border-[#262626] hover:bg-[#1c1c1c] transition-colors ${selected?.id === c.id ? 'bg-[#1c1c1c]' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center text-xs">{(c.customer?.name || '?')[0]}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.customer?.name || c.customer?.phone}</div>
                  <div className="text-xs text-[#a3a3a3] truncate">{c.status} {c.humanTakeover ? '· humano' : '· IA'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-[#141414] border border-[#262626] rounded-2xl flex flex-col">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-sm text-[#a3a3a3]">Selecione uma conversa</div>
        ) : (
          <>
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <div>
                <div className="font-medium">{selected.customer?.name || selected.customer?.phone}</div>
                <div className="text-xs text-[#a3a3a3]">{selected.humanTakeover ? 'Atendimento humano ativo' : 'IA ativa'}</div>
              </div>
              <button onClick={takeover} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border border-[#262626] hover:bg-[#1c1c1c] transition-colors">
                <Hand className="w-3.5 h-3.5" /> Assumir
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'customer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${m.role === 'customer' ? 'bg-[#1c1c1c] text-white' : 'bg-white text-black'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={send} className="p-3 border-t border-[#262626] flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite uma mensagem..."
                className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-white/40" />
              <button type="submit" className="bg-white text-black rounded-xl px-4 py-2"><Send className="w-4 h-4" /></button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}