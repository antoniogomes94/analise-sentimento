/**
 * models.config.example.js
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo para: models.config.js
 * 2. Preencha suas chaves de API reais
 * 3. models.config.js está no .gitignore e não será commitado
 */

window.MODELS = [
  {
    id: "openai-gpt4o-mini",
    provider: "openai",         // "openai" | "anthropic" | "gemini" | "ollama"
    providerName: "Open AI",
    modelName: "GPT-4o Mini",
    apiKey: "sk-SUBSTITUA_PELA_SUA_CHAVE",
    model: "gpt-4o-mini"
  },
  {
    id: "claude-sonnet",
    provider: "anthropic",
    providerName: "Claude",
    modelName: "Sonnet 4.5",
    apiKey: "sk-ant-SUBSTITUA_PELA_SUA_CHAVE",
    model: "claude-sonnet-4-5-20251001"
  },
  {
    id: "gemini-flash",
    provider: "gemini",
    providerName: "Google Gemini",
    modelName: "Flash 2.0",
    apiKey: "AIza-SUBSTITUA_PELA_SUA_CHAVE",
    model: "gemini-2.0-flash"
  },
  {
    id: "ollama-gemma",
    provider: "ollama",
    providerName: "Ollama Local",
    modelName: "Gemma 3:2b",
    baseUrl: "http://localhost:11434",
    model: "gemma3:2b"
  }
];
