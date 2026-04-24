window.ApiClient = (() => {
  const PROMPT_TEMPLATE = `Você é um especialista em análise de sentimentos linguísticos.

Analise o seguinte texto e identifique os sentimentos presentes.

TEXTO:
"{{texto}}"

Retorne EXCLUSIVAMENTE um JSON válido com a estrutura abaixo, sem nenhum texto adicional, markdown ou explicação fora do JSON:

{
  "sentimentos": {
    "medo":      <número de 0.0 a 1.0>,
    "raiva":     <número de 0.0 a 1.0>,
    "tristeza":  <número de 0.0 a 1.0>,
    "desespero": <número de 0.0 a 1.0>,
    "surpresa":  <número de 0.0 a 1.0>,
    "alivio":    <número de 0.0 a 1.0>,
    "confusao":  <número de 0.0 a 1.0>,
    "calma":     <número de 0.0 a 1.0>
  },
  "sentimento_dominante": "<nome do sentimento com maior score>",
  "valencia": "<positivo|negativo|neutro|misto>",
  "intensidade_geral": <número de 0.0 a 1.0>,
  "confiabilidade_analise": <número de 0.0 a 1.0>,
  "justificativa": "<breve explicação dos sinais linguísticos que fundamentam a análise>"
}

Critérios obrigatórios:
- Os scores de sentimentos são INDEPENDENTES entre si (não precisam somar 1.0)
- Score 0.0 = sentimento ausente; Score 1.0 = sentimento fortíssimo e explícito
- A "intensidade_geral" representa a carga emocional total do texto (0 = completamente neutro, 1 = extremamente carregado)
- A "confiabilidade_analise" deve ser MENOR quando:
    * O texto tem menos de 20 palavras
    * A linguagem é puramente técnica ou burocrática sem marcadores emocionais
    * O texto está fragmentado, com erros graves ou sem sentido
    * Há ambiguidade alta sobre o estado emocional do autor
- A "justificativa" deve citar palavras ou trechos específicos do texto original`;

  const buildPrompt = (text) => PROMPT_TEMPLATE.replace('{{texto}}', text);

  const parseJsonResponse = (rawText) => {
    let text = rawText.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      text = jsonMatch[1].trim();
    }
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Resposta não é um JSON válido: ${text.slice(0, 200)}`);
    }
  };

  const extractErrorMessage = (body) => {
    if (body.error) {
      if (typeof body.error === 'string') return body.error;
      if (body.error.message) return body.error.message;
    }
    if (body.message) return body.message;
    return 'Erro desconhecido';
  };

  const providers = {
    async openai(config, prompt) {
      const url = 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`OpenAI: ${extractErrorMessage(body) || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    },

    async anthropic(config, prompt) {
      const url = 'https://api.anthropic.com/v1/messages';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Claude: ${extractErrorMessage(body) || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    },

    async gemini(config, prompt) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Gemini: ${extractErrorMessage(body) || response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    },

    async ollama(config, prompt) {
      const baseUrl = config.baseUrl || 'http://localhost:11434';
      const url = `${baseUrl}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Ollama: ${body.error || response.statusText}`);
      }

      const data = await response.json();
      return data.message.content;
    },
  };

  const analyze = async (modelConfig, text) => {
    if (!modelConfig) throw new Error('Nenhum modelo selecionado');
    if (!text || !text.trim()) throw new Error('Texto vazio');

    const prompt = buildPrompt(text);
    const handler = providers[modelConfig.provider];

    if (!handler) {
      throw new Error(`Provider desconhecido: ${modelConfig.provider}`);
    }

    const rawText = await handler(modelConfig, prompt);
    return parseJsonResponse(rawText);
  };

  return {
    analyze,
  };
})();
