/**
 * Configuração de modelos — VERSIONADO (sem chaves reais).
 *
 * Para usar APIs reais localmente:
 *   1. Copie este arquivo para models.config.local.js
 *   2. Adicione suas chaves em models.config.local.js
 *   3. Em index.html, descomente a linha que carrega models.config.local.js
 *   models.config.local.js está no .gitignore e nunca será commitado.
 */

window.MODELS = [
  {
    id: "mock",
    provider: "mock",
    providerName: "Mock",
    modelName: "Random Data",
  },
  {
    id: "openai-gpt4o-mini",
    provider: "openai",
    providerName: "Open AI",
    modelName: "GPT-4o Mini",
    apiKey: "",
    model: "gpt-4o-mini"
  }
];
