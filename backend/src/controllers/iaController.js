const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const responder = async (req, res) => {
  const { message } = req.body;
  const provider = process.env.IA_PROVIDER;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Mensagem é obrigatória' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Mensagem muito longa (máximo 2000 caracteres)' });
  }

  try {
    if (provider === 'gemini') {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Chave da API Gemini não configurada' });
      }
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(message);
      return res.json({ response: result.response.text(), provider });
    } else if (provider === 'ollama') {
      if (!process.env.OLLAMA_BASE_URL || !process.env.OLLAMA_MODEL) {
        return res.status(500).json({ error: 'Ollama não configurado corretamente' });
      }
      const response = await axios.post(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        model: process.env.OLLAMA_MODEL,
        prompt: message,
        stream: false
      });
      return res.json({ response: response.data.response, provider });
    }
    res.status(400).json({ error: 'Provedor de IA inválido' });
  } catch (error) {
    console.error('IA Error:', error);
    res.status(500).json({ error: 'Erro ao processar IA' });
  }
};

module.exports = { responder };
