import React, { useEffect, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import api from '../lib/api';

export default function Customers() {
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/customers').then((r) => setList(r.data || [])).catch(() => {}); }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Clientes</h1><p className="text-sm text-[#a3a3a3] mt-1">Gerencie seus clientes</p></div>
        <button className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-xl text-sm"><Plus className="w-4 h-4" /> Novo cliente</button>
      </div>
      <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f0f0f] text-[#a3a3a3]">
            <tr><th className="text-left px-4 py-3">Nome</th><th className="text-left px-4 py-3">Telefone</th><th className="text-left px-4 py-3">Etiquetas</th></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={3} className="px-4 py-6 text-center text-[#a3a3a3]">Nenhum cliente ainda.</td></tr>}
            {list.map((c) => (
              <tr key={c.id} className="border-t border-[#262626]">
                <td className="px-4 py-3">{c.name || '—'}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3"><Tag className="w-3.5 h-3.5 inline text-[#a3a3a3]" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}