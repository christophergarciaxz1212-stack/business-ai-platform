const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const { prisma, withTenant } = require('../db');
const { decrypt } = require('../crypto');
const { logger } = require('../logger');

const FREE_MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', type: 'cloud', execution: 'nuvem', limits: '15 RPM / 1500 RPD (free)', speed: 'rápido', requiresKey: true, priority: 2 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', type: 'cloud', execution: 'nuvem', limits: '2 RPM / 50 RPD (free)', speed: 'médio', requiresKey: true, priority: 3 },
  { id: 'llama3.2', name: 'Llama 3.2 (Ollama)', provider: 'ollama', type: 'local', execution: 'local', limits: 'ilimitado (local)', speed: 'depende do hardware', requiresKey: false, priority: 1 },
  { id: 'mistral', name: 'Mistral (Ollama)', provider: 'ollama', type: 'local', execution: 'local', limits: 'ilimitado (local)', speed: 'depende do hardware', requiresKey: false, priority: 1 },
];

async function listModels() {
  return FREE_MODELS;
}

async function getAiConfig(tenantId) {
  return prisma.aiConfig.findUnique({ where: { tenantId } });
}

async function testProvider({ provider, model, apiKey, baseUrl }) {
  try {
    if (provider === 'gemini') {
      if (!apiKey) return { ok: false, error: 'Chave não informada' };
      const genAI = new GoogleGenerativeAI(apiKey);
      const m = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });
      const r = await m.generateContent('Responda apenas: OK');
      return { ok: true, sample: r.response.text().slice(0, 80) };
    }
    if (provider === 'ollama') {
      const url = baseUrl || 'http://localhost:11434';
      const res = await axios.post(`${url}/api/generate`, { model: model || 'llama3.2', prompt: 'Responda apenas: OK', stream: false }, { timeout: 30000 });
      return { ok: true, sample: (res.data.response || '').slice(0, 80) };
    }
    // openai-compatible
    const res = await axios.post(`${baseUrl}/chat/completions`, {
      model, messages: [{ role: 'user', content: 'Responda apenas: OK' }],
    }, { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 30000 });
    return { ok: true, sample: res.data.choices?.[0]?.message?.content?.slice(0, 80) };
  } catch (err) {
    logger.warn({ err: err.message, provider }, 'provider test failed');
    return { ok: false, error: err.message };
  }
}

async function generateReply({ tenantId, conversationId, customerMessage, mediaType }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const aiCfg = await getAiConfig(tenantId);
  if (!aiCfg || !aiCfg.isActive) throw new Error('IA desativada');

  // build system prompt
  const knowledge = await retrieveKnowledge(tenantId, customerMessage);
  const history = await getHistory(conversationId, 8);

  const systemPrompt = buildSystemPrompt(tenant, aiCfg, knowledge);

  const providers = await buildProviderChain(aiCfg);
  let lastErr = null;
  for (const p of providers) {
    try {
      const reply = await callProvider(p, systemPrompt, history, customerMessage, mediaType);
      return { reply, provider: p.provider, model: p.model };
    } catch (err) {
      lastErr = err;
      logger.warn({ err: err.message, provider: p.provider }, 'provider failed, trying fallback');
    }
  }
  throw lastErr || new Error('Nenhum provedor disponível');
}

function buildSystemPrompt(tenant, aiCfg, knowledge) {
  const personaMap = {
    formal: 'Use linguagem formal e profissional.',
    informal: 'Use linguagem informal e próxima.',
    friendly: 'Seja amigável, acolhedor e prestativo.',
    commercial: 'Foque em vendas e conversão.',
    persuasive: 'Seja persuasivo e convincente.',
    objective: 'Seja objetivo e direto ao ponto.',
    custom: '',
  };
  const lengthMap = { short: 'Respostas curtas (1-2 frases).', medium: 'Respostas de tamanho médio.', long: 'Respostas detalhadas.' };
  const parts = [];
  parts.push(aiCfg.systemPrompt || 'Você é um atendente virtual.');
  parts.push(personaMap[aiCfg.personality] || '');
  parts.push(lengthMap[aiCfg.responseLength] || '');
  if (aiCfg.useEmojis) parts.push('Pode usar emojis com moderação.');
  parts.push(`Empresa: ${tenant.companyName}. Segmento: ${tenant.segment}.`);
  if (tenant.description) parts.push(`Descrição: ${tenant.description}.`);
  if (tenant.policies) parts.push(`Políticas: ${tenant.policies}.`);
  if (tenant.products && Array.isArray(tenant.products) && tenant.products.length) parts.push(`Produtos: ${JSON.stringify(tenant.products)}.`);
  if (tenant.services && Array.isArray(tenant.services) && tenant.services.length) parts.push(`Serviços: ${JSON.stringify(tenant.services)}.`);
  if (tenant.faq && Array.isArray(tenant.faq) && tenant.faq.length) parts.push(`FAQ: ${JSON.stringify(tenant.faq)}.`);
  if (knowledge.length) parts.push(`Base de conhecimento relevante:\n${knowledge.map((k) => '- ' + k.content).join('\n')}`);
  parts.push('REGRAS: Não invente preços, disponibilidade, políticas ou informações. Se não souber, diga que não sabe e ofereça encaminhamento para um atendente humano. Responda no idioma do cliente.');
  return parts.filter(Boolean).join('\n');
}

async function retrieveKnowledge(tenantId, query) {
  const chunks = await prisma.knowledgeChunk.findMany({ where: { tenantId } });
  if (!chunks.length) return [];
  const q = String(query || '').toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);
  const scored = chunks.map((c) => {
    const text = (c.content + ' ' + c.keywords).toLowerCase();
    let score = 0;
    for (const t of terms) if (text.includes(t)) score += 1;
    return { c, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  return scored.map((x) => x.c);
}

async function getHistory(conversationId, n) {
  const msgs = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: n,
  });
  return msgs.reverse().map((m) => ({ role: m.role === 'customer' ? 'user' : 'assistant', content: m.content }));
}

async function buildProviderChain(aiCfg) {
  const chain = [];
  // primary
  const apiKey = aiCfg.apiKeyEnc ? decrypt(aiCfg.apiKeyEnc) : process.env.GEMINI_API_KEY;
  chain.push({ provider: aiCfg.provider, model: aiCfg.model, apiKey, baseUrl: aiCfg.baseUrl });
  // fallback: if gemini primary, try ollama; if ollama, try gemini
  if (aiCfg.provider === 'gemini') {
    chain.push({ provider: 'ollama', model: 'llama3.2', apiKey: null, baseUrl: 'http://host.docker.internal:11434' });
  } else {
    if (process.env.GEMINI_API_KEY) chain.push({ provider: 'gemini', model: 'gemini-1.5-flash', apiKey: process.env.GEMINI_API_KEY, baseUrl: null });
  }
  return chain;
}

async function callProvider(p, systemPrompt, history, customerMessage, mediaType) {
  if (p.provider === 'gemini') {
    if (!p.apiKey) throw new Error('Gemini sem chave');
    const genAI = new GoogleGenerativeAI(p.apiKey);
    const model = genAI.getGenerativeModel({ model: p.model, systemInstruction: systemPrompt });
    const chat = model.startChat({ history: history.map((h) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })) });
    const prompt = mediaType ? `[Cliente enviou ${mediaType}] ${customerMessage}` : customerMessage;
    const r = await chat.sendMessage(prompt);
    return r.response.text();
  }
  if (p.provider === 'ollama') {
    const url = p.baseUrl || 'http://localhost:11434';
    const prompt = `${systemPrompt}\n\nHistórico:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n\nCliente: ${customerMessage}\nAssistente:`;
    const res = await axios.post(`${url}/api/generate`, { model: p.model, prompt, stream: false }, { timeout: 60000 });
    return res.data.response;
  }
  // openai-compatible
  const res = await axios.post(`${p.baseUrl}/chat/completions`, {
    model: p.model,
    messages: [{ role: 'system', content: systemPrompt }, ...history.map((h) => ({ role: h.role, content: h.content })), { role: 'user', content: customerMessage }],
  }, { headers: { Authorization: `Bearer ${p.apiKey}` }, timeout: 60000 });
  return res.data.choices?.[0]?.message?.content;
}

async function selectBestFree(tenantId) {
  const available = await listModels();
  // prefer local ollama if reachable
  let chosen = null;
  for (const m of available.sort((a, b) => a.priority - b.priority)) {
    const test = await testProvider({ provider: m.provider, model: m.id, apiKey: m.provider === 'gemini' ? process.env.GEMINI_API_KEY : null, baseUrl: m.provider === 'ollama' ? 'http://localhost:11434' : null });
    if (test.ok) { chosen = m; break; }
  }
  if (!chosen) chosen = available.find((m) => m.provider === 'gemini') || available[0];
  // persist
  await prisma.aiConfig.upsert({
    where: { tenantId },
    create: { tenantId, provider: chosen.provider, model: chosen.id, isActive: true },
    update: { provider: chosen.provider, model: chosen.id, isActive: true },
  });
  return chosen;
}

module.exports = { listModels, testProvider, generateReply, selectBestFree, getAiConfig };