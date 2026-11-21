import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import api from '../lib/api';

export default function Settings() {
  const [cfg, setCfg] = useState({ companyName: '', segment: 'other', description: '', phone: '', address: '', workingHours: {}, timezone: 'America/Sao_Paulo', policies: '' });
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.get('/tenants/me').then((r) => setCfg(r.data)).catch(() => {}); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.patch('/tenants/me', cfg).catch(() => {});
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Configurações</h1><p className="text-sm text-[#a3a3a3] mt-1">Informações do negócio e comportamento</p></div>
      {saved && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">Salvo</div>}
      <form onSubmit={save} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4">
        <Input label="Nome da empresa" value={cfg.companyName} onChange={(v) => setCfg({ ...cfg, companyName: v })} />
        <Input label="Telefone" value={cfg.phone} onChange={(v) => setCfg({ ...cfg, phone: v })} />
        <Input label="Endereço" value={cfg.address} onChange={(v) => setCfg({ ...cfg, address: v })} />
        <Input label="Timezone (IANA)" value={cfg.timezone} onChange={(v) => setCfg({ ...cfg, timezone: v })} />
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Descrição</label>
          <textarea rows={3} value={cfg.description} onChange={(e) => setCfg({ ...cfg, description: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 resize-none" />
        </div>
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Políticas comerciais</label>
          <textarea rows={4} value={cfg.policies} onChange={(e) => setCfg({ ...cfg, policies: e.target.value })} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 resize-none" />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-white text-black font-medium px-5 py-2.5 rounded-xl text-sm"><Save className="w-4 h-4" /> Salvar</button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40" />
    </div>
  );
}