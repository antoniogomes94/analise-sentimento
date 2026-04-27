# Análise de Sentimentos

Ferramenta web estática para análise de sentimentos em textos usando múltiplos modelos de IA. Vanilla HTML/CSS/JS, sem build step, sem backend.

🌐 **Demo online:** [antoniogomes94.github.io/analise-sentimento](https://antoniogomes94.github.io/analise-sentimento/)

## Uso rápido (demo online)

A demo pública vem com dois modelos prontos:

- **Mock** — gera scores aleatórios, ótimo para testar a interface sem nenhuma chave.
- **GPT-4o Mini** — requer que você cole a sua própria chave da OpenAI no campo que aparece ao selecionar o modelo. A chave fica salva apenas no `localStorage` do seu navegador e é enviada exclusivamente para `api.openai.com`.

Para obter uma chave da OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

## Uso local (desenvolvimento)

```bash
git clone https://github.com/antoniogomes94/analise-sentimento.git
cd analise-sentimento
python -m http.server 8000
# Acesse http://localhost:8000
```

Para adicionar mais modelos (Claude, Gemini, Ollama) ou pré-configurar chaves de API sem precisar colar pela UI, crie um arquivo `models.config.local.js`:

```bash
cp models.config.example.js models.config.local.js
```

Edite `models.config.local.js` com suas chaves e modelos. Esse arquivo está no `.gitignore` e nunca é commitado. Quando ele existe, sobrescreve a configuração padrão silenciosamente. Quando não existe, a aplicação usa `models.config.js` (o default versionado, com Mock + GPT sem chave).

### Provedores suportados

| Provedor          | Precisa de chave? | Como obter                                                          |
|-------------------|-------------------|---------------------------------------------------------------------|
| Mock              | Não               | —                                                                    |
| OpenAI            | Sim               | [platform.openai.com](https://platform.openai.com)                  |
| Anthropic (Claude) | Sim              | [console.anthropic.com](https://console.anthropic.com)              |
| Google Gemini     | Sim               | [aistudio.google.com](https://aistudio.google.com)                  |
| Ollama (local)    | Não               | [ollama.com](https://ollama.com)                                    |

## Configuração de modelos

Estrutura de cada entrada em `window.MODELS`:

```javascript
{
  id: "openai-gpt4o-mini",
  provider: "openai",         // "mock" | "openai" | "anthropic" | "gemini" | "ollama"
  providerName: "Open AI",    // exibido na dropdown
  modelName: "GPT-4o Mini",   // exibido na dropdown
  apiKey: "",                 // se vazio, a UI pede a chave ao usuário
  model: "gpt-4o-mini"        // ID exato do modelo no provedor
}
```

Quando `apiKey` está vazio para um provedor que exige chave, um campo aparece abaixo do seletor de modelos para o usuário colar a sua. A chave é persistida no `localStorage` do navegador (uma slot por provedor: `apiKey_openai`, `apiKey_anthropic`, etc).

### Ollama (modelos locais)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma3:2b
```

Adicione ao seu `models.config.local.js`:

```javascript
{
  id: "ollama-gemma",
  provider: "ollama",
  providerName: "Ollama Local",
  modelName: "Gemma 3:2b",
  baseUrl: "http://localhost:11434",
  model: "gemma3:2b"
}
```

## Tema claro/escuro

A aplicação tem um botão no canto superior direito para alternar entre tema claro e escuro. A escolha é persistida no `localStorage`. Se nenhuma preferência foi salva ainda, a aplicação respeita o `prefers-color-scheme` do sistema operacional.

## Sobre a segurança das chaves de API

**Esta é uma aplicação 100% client-side.** Qualquer chave de API embutida no código JavaScript fica visível para qualquer pessoa que abra o DevTools — inclusive em deploys do GitHub Pages, mesmo que a chave venha de um secret injetado no build.

Por isso o projeto adota o seguinte modelo:

1. O arquivo versionado [models.config.js](models.config.js) **nunca contém chaves**. Ele só define quais modelos aparecem na demo pública (Mock + GPT-4o Mini, esse último com `apiKey: ""`).
2. Para uso público, o usuário cola a própria chave na UI. A chave fica somente no `localStorage` do navegador dele e é enviada apenas para a API do provedor (ex: `api.openai.com`) — nunca para nenhum servidor deste projeto.
3. Para uso local de desenvolvimento, você cria um `models.config.local.js` (gitignored) com suas chaves preenchidas, evitando ter que colar a chave pela UI a cada uso.

⚠️ **Nunca commite `models.config.local.js`**. O `.gitignore` já bloqueia, mas confira sempre antes de fazer push.

Para uso em produção com dados sensíveis ou para evitar que cada usuário precise da própria chave, a abordagem correta é mover a chamada da API para um proxy serverless (Cloudflare Workers, Vercel Functions, etc). Este projeto não cobre esse caso.

## Estrutura

```
analise-sentimento/
├── index.html                  # Página principal
├── css/
│   └── style.css               # Estilos (tema claro/escuro via data-theme)
├── js/
│   ├── theme.js                # Toggle e persistência de tema
│   ├── models.js               # Dropdown de modelos
│   ├── api-client.js           # Integração com APIs (openai/anthropic/gemini/ollama/mock)
│   └── app.js                  # Lógica principal e fluxo da análise
├── models.config.js            # Config padrão versionada (sem chaves)
├── models.config.local.js      # Config local override (gitignored, com chaves)
├── models.config.example.js    # Template de referência
├── .gitignore
└── README.md
```

A ordem de carregamento em `index.html`: `models.config.js` → `models.config.local.js` (se existir, via `fetch` silencioso) → `theme.js` → `models.js` → `api-client.js` → `app.js`.

## Como funciona

1. Selecione um modelo na dropdown.
2. Se o modelo precisa de chave e nenhuma foi pré-configurada, cole sua chave no campo que aparece.
3. Cole o texto para análise.
4. Clique em **Analisar**.
5. Visualize:
   - Barras de cada sentimento (0-100%)
   - Sentimento dominante e valência
   - Intensidade geral e confiabilidade da análise
   - JSON bruto (expandível)

## Sentimentos analisados

- **Medo** — ansiedade e preocupação
- **Raiva** — irritação e agressividade
- **Tristeza** — melancolia e desânimo
- **Desespero** — perda de esperança
- **Surpresa** — inesperado e assombro
- **Alívio** — conforto e descompressão
- **Confusão** — incerteza e ambiguidade
- **Calma** — tranquilidade e serenidade

## Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão à internet (para APIs online)
- Chave de API do provedor escolhido (exceto Mock e Ollama)
- Ollama instalado localmente (opcional)

## Desenvolvimento

Sem dependências e sem build step. Para rodar:

```bash
python -m http.server 8000
```

## Uso pessoal / educacional

Projeto desenvolvido para fins didáticos e uso pessoal. Não recomendado para aplicações em produção com dados sensíveis.
