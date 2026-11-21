import React, { useState } from "react";
import { Bot, Save, CheckCircle2, ShieldAlert } from "lucide-react";

export default function SettingsForm() {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("gemini-1.5-flash");
  const [systemPrompt, setSystemPrompt] = useState(
    "Você é um assistente virtual atencioso e prestativo para atendimento ao cliente via WhatsApp. Responda de forma clara, educada e direta ao ponto."
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ia/responder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey, modelName, systemPrompt })
      });
      if (!response.ok) throw new Error('Falha ao salvar configuração');
      const data = await response.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError('Erro ao salvar configuração: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Configuração da IA de Atendimento</h2>
          <p className="text-slate-400 text-sm">
            Escolha o modelo gratuito e defina o comportamento do seu assistente no WhatsApp
          </p>
        </div>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Configurações de IA salvas e aplicadas com sucesso!</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Provedor de IA
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                if (e.target.value === "gemini") setModelName("gemini-1.5-flash");
                if (e.target.value === "ollama") setModelName("llama3");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="gemini">Google Gemini (Gratuito via Google AI Studio)</option>
              <option value="ollama">Ollama (Local / Gratuito - Llama 3 / Mistral)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {provider === "gemini" ? "Chave da API Google Gemini" : "URL do Servidor Ollama"}
            </label>
            <input
              type={provider === "gemini" ? "password" : "text"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={provider === "gemini" ? "AIzaSy... (Cole sua chave gratuita)" : "http://localhost:11434"}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Modelo de IA
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            placeholder="ex: gemini-1.5-flash"
          />
          <p className="text-xs text-slate-500 mt-1">
            {provider === "gemini"
              ? "Recomendado: gemini-1.5-flash (gratuito e ultrarrápido)."
              : "Certifique-se de que o Ollama está rodando localmente com o modelo instalado."}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prompt do Sistema (Personalidade da IA)
          </label>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
            placeholder="Descreva como a IA deve responder aos seus clientes..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Configuração de IA"}
          </button>
        </div>
      </form>
    </div>
  );
}
