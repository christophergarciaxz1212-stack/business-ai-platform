import React, { useEffect, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import api from '../lib/api';

export default function Knowledge() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  useEffect(() => { api.get('/knowledge/docs').then((r) => setDocs(r.data || [])).catch(() => {}); }, []);

  const add = async (e) => {
    e.preventDefault();
    await api.post('/knowledge/docs', { title, content }).catch(() => {});
    setTitle(''); setContent('');
    api.get('/knowledge/docs').then((r) => setDocs(r.data || [])).catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Base de conhecimento</h1><p className="text-sm text-[#a3a3a3] mt-1">Alimente a IA com informações do seu negócio</p></div>
      <form onSubmit={add} className="bg-[#141414] border border-[#262626] rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Título</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40" />
        </div>
        <div>
          <label className="block text-xs text-[#a3a3a3] mb-1.5">Conteúdo</label>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white/40 resize-none" />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-white text-black font-medium px-4 py-2 rounded-xl text-sm"><Upload className="w-4 h-4" /> Adicionar documento</button>
      </form>
      <div className="space-y-3">
        {docs.map((d) => (
          <div key={d.id} className="bg-[#141414] border border-[#262626] rounded-2xl p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#a3a3a3] mt-0.5" />
            <div>
              <div className="font-medium text-sm">{d.title}</div>
              <div className="text-xs text-[#a3a3a3] line-clamp-2 mt-1">{d.content}</div>
            </div>
          </div>
        ))}
        {docs.length === 0 && <div className="text-sm text-[#a3a3a3]">Nenhum documento cadastrado.</div>}
      </div>
    </div>
  );
}