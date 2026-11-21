import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, SkipForward } from 'lucide-react';
import api from '../lib/api';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo ao JARVIS', optional: false },
  { id: 'business', title: 'Informações do negócio', optional: false },
  { id: 'whatsapp', title: 'Conectar WhatsApp', optional: true },
  { id: 'ai', title: 'Configurar inteligência artificial', optional: true },
  { id: 'persona', title: 'Personalidade do atendente', optional: true },
  { id: 'hours', title: 'Horários de funcionamento', optional: true },
  { id: 'done', title: 'Tudo pronto!', optional: false },
];

export default function Onboarding() {
  const [idx, setIdx] = useState(0);
  const [data, setData] = useState({ companyName: '', segment: 'other', description: '', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const step = STEPS[idx];
  const progress = ((idx) / (STEPS.length - 1)) * 100;

  const next = async () => {
    if (step.id === 'business') {
      setSaving(true);
      try { await api.patch('/tenants/me', data); } catch (e) { /* ignore */ }
      setSaving(false);
    }
    if (idx < STEPS.length - 1) setIdx(idx + 1);
    else navigate('/');
  };
  const prev = () => { if (idx > 0) setIdx(idx - 1); };
  const skip = () => { if (idx < STEPS.length - 1) setIdx(idx + 1); else navigate('/'); };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[#a3a3a3] mb-2">
            <span>Etapa {idx + 1} de {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#1c1c1c] rounded-full overflow-hidden">
            <motion.div className="h-full bg-white" animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] rounded-2xl p-8 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div key={step.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              <h2 className="text-xl font-bold mb-1">{step.title}</h2>
              <p className="text-sm text-[#a3a3a3] mb-6">{step.optional ? 'Etapa opcional — você pode pular e configurar depois.' : 'Etapa obrigatória.'}</p>

              {step.id === 'welcome' && (
                <div className="space-y-3 text-sm text-[#a3a3a3]">
                  <p>Vamos configurar seu atendente virtual em poucos passos.</p>
                  <p>Você pode pular etapas não obrigatórias e terminar depois em <strong className="text-white">Configurações</strong>.</p>
                </div>
              )}
              {step.id === 'business' && (
                <div className="space-y-4">
                  <Input label="Nome da empresa" value={data.companyName} onChange={(v) => setData({ ...data, companyName: v })} />
                  <Select label="Segmento" value={data.segment} onChange={(v) => setData({ ...data, segment: v })}
                    options={['retail', 'services', 'restaurant', 'clinic', 'education', 'other']} />
                  <Textarea label="Descrição" value={data.description} onChange={(v) => setData({ ...data, description: v })} />
                </div>
              )}
              {step.id === 'whatsapp' && (
                <div className="text-sm text-[#a3a3a3]">Configure em <strong className="text-white">WhatsApp</strong> no menu lateral. Você precisará do Phone Number ID e do Access Token da Meta.</div>
              )}
              {step.id === 'ai' && (
                <div className="text-sm text-[#a3a3a3]">Configure em <strong className="text-white">Modelos de IA</strong>. Recomendamos "Selecionar melhor modelo gratuito".</div>
              )}
              {step.id === 'persona' && (
                <div className="text-sm text-[#a3a3a3]">Configure a personalidade em <strong className="text-white">Atendente IA</strong>.</div>
              )}
              {step.id === 'hours' && (
                <div className="text-sm text-[#a3a3a3]">Configure horários em <strong className="text-white">Configurações</strong>.</div>
              )}
              {step.id === 'done' && (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Check className="w-7 h-7" /></div>
                  <p className="text-sm text-[#a3a3a3]">Configuração inicial concluída. Você pode ajustar tudo depois.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={idx === 0} className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-white disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="flex items-center gap-3">
            {step.optional && idx < STEPS.length - 1 && (
              <button onClick={skip} className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" /> Pular
              </button>
            )}
            <button onClick={next} disabled={saving} className="flex items-center gap-2 bg-white text-black font-medium px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50">
              {idx === STEPS.length - 1 ? 'Ir para o painel' : 'Próximo'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-colors" />
    </div>
  );
}
function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-colors resize-none" />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 transition-colors">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}