import React from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  return (
    <div className="max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-bold">Ajuda</h1><p className="text-sm text-[#a3a3a3] mt-1">Documentação e suporte</p></div>
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4 text-sm text-[#a3a3a3]">
        <p>Fluxo recomendado:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Registre sua conta e conclua o onboarding.</li>
          <li>Configure seu negócio em Configurações.</li>
          <li>Conecte o WhatsApp em WhatsApp (Meta Cloud API).</li>
          <li>Selecione um modelo de IA em Modelos de IA.</li>
          <li>Personalize o atendente em Atendente IA.</li>
          <li>Alimente a base de conhecimento.</li>
          <li>Ative o atendimento.</li>
        </ol>
        <p className="pt-2">Limitações conhecidas: o túnel Cloudflare gera uma URL efêmera que muda a cada reinício — atualize o webhook na Meta quando mudar.</p>
      </div>
    </div>
  );
}