import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

const PERSONALITIES = ['formal', 'informal', 'friendly', 'commercial', 'persuasive', 'objective', 'custom'];
const LENGTHS = ['short', 'medium', 'long'];

export default function AiAgent() {
  const [cfg, setCfg] = useState({ systemPrompt: '', personality: 'friendly', responseLength: 'medium', useEmojis: true, autoTransfer: false });
  const [saved, setSaved] = useState(false);
  useEffect(() => { api.get('/ai/config').then((r) => setCfg(r.data || cfg)).catch(() => {}); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.patch('/ai/config', cfg).catch(() => {});
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Atendente IA</h1><p className="text-sm text-[#a3a3a3] mt-1">Personalize o comportamento do seu atendente</p></div>
      {saved && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Salvo</div>}
      <form onSubmit={save} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Personalidade" value={cfg.personality} onChange={(v) => setCfg({ ...cfg, personality: v })} options={PERSONALITIES} />
          <Select label="Tamanho da resposta" value={cfg.responseLength} onChange={(v) => setCfg({ ...cfg, responseLength: v })} options={LENGTHS} />
        </div>
        <Toggle label="Usar emojis" value={cfg.useEmojis} onChange={(v) => setCfg({ ...cfg, useEmojis: v })} />
        <Toggle label="Encaminhar automaticamente para humano em situações críticas" value={cfg.autoTransfer} onChange={(v) => setCfg({ ...cfg, autoTransfer: v })} />
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Prompt do sistema</label>
          <textarea rows={6} value={cfg.systemPrompt} onChange={(e) => setCfg({ ...cfg, systemPrompt: e.target.value })}
            className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 resize-none" />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-white text-black font-medium px-5 py-2.5 rounded-xl text-sm"><Save className="w-4 h-4" /> Salvar</button>
      </form>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center justify-between bg-[#0a0a0a] border border-[#262626] rounded-xl px-4 py-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-colors ${value ? 'bg-white' : 'bg-[#262626]'} relative`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${value ? 'right-0.5 bg-black' : 'left-0.5 bg-[#a3a3a3]'}`} />
      </button>
    </label>
  );
}