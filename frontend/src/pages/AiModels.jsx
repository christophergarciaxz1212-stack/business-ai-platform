import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function AiModels() {
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [testing, setTesting] = useState(false);
  const [autoSelecting, setAutoSelecting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/ai/models').then((r) => setModels(r.data || [])).catch(() => {});
    api.get('/ai/config').then((r) => setSelected(r.data?.model)).catch(() => {});
  }, []);

  const test = async (m) => {
    setTesting(true); setMsg('');
    try {
      await api.post('/ai/test', { model: m.id });
      setMsg('Conexão OK: ' + m.name);
    } catch (e) { setMsg('Falha: ' + (e.response?.data?.error || e.message)); }
    finally { setTesting(false); }
  };

  const auto = async () => {
    setAutoSelecting(true); setMsg('');
    try {
      const { data } = await api.post('/ai/select-best-free');
      setSelected(data.model);
      setMsg('Selecionado: ' + data.model);
    } catch (e) { setMsg('Falha: ' + (e.response?.data?.error || e.message)); }
    finally { setAutoSelecting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Modelos de IA</h1><p className="text-sm text-[#a3a3a3] mt-1">Escolha o modelo gratuito para seu atendente</p></div>
        <button onClick={auto} disabled={autoSelecting} className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-xl text-sm disabled:opacity-50">
          {autoSelecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Selecionar melhor modelo gratuito
        </button>
      </div>
      {msg && <div className="p-3 bg-[#141414] border border-[#262626] rounded-xl text-sm">{msg}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => (
          <div key={m.id} className={`bg-[#141414] border rounded-2xl p-5 ${selected === m.id ? 'border-white' : 'border-[#262626]'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{m.name}</div>
              {selected === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <div className="text-xs text-[#a3a3a3] space-y-1">
              <div>Provedor: {m.provider}</div>
              <div>Tipo: {m.type} ({m.execution})</div>
              <div>Limites: {m.limits}</div>
              <div>Velocidade: {m.speed}</div>
              <div>Chave API: {m.requiresKey ? 'sim' : 'não'}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setSelected(m.id); api.patch('/ai/config', { model: m.id, provider: m.provider }).catch(() => {}); }} className="text-xs px-3 py-1.5 rounded-lg border border-[#262626] hover:bg-[#1c1c1c]">Selecionar</button>
              <button onClick={() => test(m)} disabled={testing} className="text-xs px-3 py-1.5 rounded-lg bg-white text-black">Testar</button>
            </div>
          </div>
        ))}
        {models.length === 0 && <div className="text-sm text-[#a3a3a3]">Nenhum modelo disponível.</div>}
      </div>
    </div>
  );
}