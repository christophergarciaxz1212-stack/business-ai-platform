import React, { useEffect, useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import api from '../lib/api';

export default function WhatsApp() {
  const [phoneId, setPhoneId] = useState('');
  const [token, setToken] = useState('');
  const [connected, setConnected] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('whatsapp_verify_token_secure_2025');

  useEffect(() => {
    api.get('/whatsapp/config').then((r) => {
      setPhoneId(r.data?.phoneNumberId || '');
      setConnected(!!r.data?.isActive);
    }).catch(() => {});
    api.get('/whatsapp/webhook-info').then((r) => {
      setWebhookUrl(r.data?.url || '');
      setVerifyToken(r.data?.verifyToken || verifyToken);
    }).catch(() => {});
  }, []);

  const connect = async (e) => {
    e.preventDefault();
    await api.post('/whatsapp/config', { phoneNumberId: phoneId, accessToken: token }).catch(() => {});
    setConnected(true);
  };

  const copy = (t) => navigator.clipboard.writeText(t);

  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">WhatsApp</h1><p className="text-sm text-[#a3a3a3] mt-1">Conecte seu WhatsApp Business (Meta Cloud API)</p></div>
      {connected && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> WhatsApp conectado</div>}
      <form onSubmit={connect} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4">
        <Field label="Phone Number ID (Meta)" value={phoneId} onChange={setPhoneId} placeholder="103492817483921" />
        <Field label="Permanent Access Token" value={token} onChange={setToken} placeholder="EAAG..." type="password" />
        <button type="submit" className="bg-white text-black font-medium px-5 py-2.5 rounded-xl text-sm">Salvar e conectar</button>
      </form>
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-3">
        <h3 className="font-semibold">Configuração do Webhook na Meta</h3>
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">URL do Webhook</label>
          <div className="flex gap-2">
            <code className="flex-1 bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2 text-xs text-emerald-300 font-mono break-all">{webhookUrl || 'https://seu-tunel.trycloudflare.com/api/whatsapp/webhook'}</code>
            <button onClick={() => copy(webhookUrl)} className="px-3 py-2 rounded-xl border border-[#262626] hover:bg-[#1c1c1c]"><Copy className="w-4 h-4" /></button>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Verify Token</label>
          <code className="block bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2 text-xs text-slate-300 font-mono">{verifyToken}</code>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a3a3] mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40" />
    </div>
  );
}