import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-sm text-[#a3a3a3] mt-1">Desempenho do atendimento</p></div>
      <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 flex flex-col items-center justify-center h-64 text-[#a3a3a3]">
        <BarChart3 className="w-10 h-10 mb-3" />
        <p className="text-sm">Relatórios detalhados em breve.</p>
      </div>
    </div>
  );
}