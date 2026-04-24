# Análise de Sentimentos

Uma ferramenta web estática para análise de sentimentos em textos usando múltiplos modelos de IA via API.

## Uso

### Configuração Rápida

1. **Clone o repositório**
   ```bash
   git clone https://github.com/antoniogomes313/analise-sentimento.git
   cd analise-sentimento
   ```

2. **Copie o arquivo de configuração**
   ```bash
   cp models.config.example.js models.config.js
   ```

3. **Edite `models.config.js`** com suas chaves de API reais
   - Remova ou comente os modelos que não deseja usar
   - Preencha os campos `apiKey` com suas chaves

4. **Abra `index.html`** no navegador
   - Abra diretamente (via `file://`) ou
   - Use um servidor local: `python -m http.server 8000`

### Provedores Suportados

| Provedor | Precisa de chave? | Como obter |
|----------|-------------------|-----------|
| **OpenAI** | Sim | [platform.openai.com](https://platform.openai.com) |
| **Google Gemini** | Sim | [aistudio.google.com](https://aistudio.google.com) |
| **Anthropic/Claude** | Sim | [console.anthropic.com](https://console.anthropic.com) |
| **Ollama** (local) | Não | [ollama.com](https://ollama.com) |

## Configuração de Modelos

O arquivo `models.config.js` define os modelos disponíveis:

```javascript
window.MODELS = [
  {
    id: "openai-gpt4o-mini",
    provider: "openai",         // "openai" | "anthropic" | "gemini" | "ollama"
    providerName: "Open AI",    // Exibido na dropdown
    modelName: "GPT-4o Mini",   // Exibido na dropdown
    apiKey: "sk-...",           // Sua chave de API
    model: "gpt-4o-mini"        // ID exato do modelo
  },
  // ... mais modelos
];
```

## Usando Ollama (Local)

Para usar modelos locais com Ollama:

1. **Instale Ollama**
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Baixe um modelo**
   ```bash
   ollama pull gemma3:2b
   ```

3. **Configure em `models.config.js`**
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

Não é necessária chave de API para Ollama.

## Segurança

⚠️ **Importante**: As chaves de API ficam apenas no arquivo `models.config.js` local, que está no `.gitignore` e **nunca será commitado**.

**Aviso**: Nunca compartilhe ou commite seu arquivo `models.config.js` com chaves reais. Use apenas para desenvolvimento pessoal.

## GitHub Pages

Para hospedar no GitHub Pages sem chaves de API:

1. Faça commit e push sem o arquivo `models.config.js`
2. A página funcionará mas mostrará "Nenhum modelo configurado"
3. Usuários locais podem criar seu próprio `models.config.js`
4. Para usar Ollama local, não é necessário arquivo de config

## Estrutura do Projeto

```
analise-sentimento/
├── index.html                 # Página principal
├── css/
│   └── style.css             # Estilos (tema escuro)
├── js/
│   ├── models.js             # Gerenciador de dropdown de modelos
│   ├── api-client.js         # Integração com APIs
│   └── app.js                # Lógica da aplicação
├── models.config.example.js  # Exemplo de configuração
├── models.config.js          # Configuração real (gitignored)
├── .gitignore
└── README.md
```

## Como Funciona

1. Selecione um modelo na dropdown
2. Cole o texto para análise
3. Clique em "Analisar"
4. Visualize:
   - Gráficos de cada sentimento (0-100%)
   - Sentimento dominante e valência
   - Intensidade geral e confiabilidade da análise
   - JSON bruto (expandível)

## Sentimentos Analisados

- **Medo**: Expressões de ansiedade e preocupação
- **Raiva**: Irritação e agressividade
- **Tristeza**: Melancolia e desânimo
- **Desespero**: Perda de esperança
- **Surpresa**: Inesperado e assombro
- **Alívio**: Conforto e descompressão
- **Confusão**: Incerteza e ambiguidade
- **Calma**: Tranquilidade e serenidade

## Requisitos

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Conexão com internet (para APIs online)
- Chaves de API (para OpenAI, Gemini, Anthropic)
- Ollama instalado localmente (opcional, para modelos locais)

## Desenvolvimento

Não há dependências ou build step. Todos os arquivos são vanilla HTML/CSS/JavaScript e funcionam em qualquer servidor estático ou via `file://`.

Para rodar localmente:
```bash
python -m http.server 8000
# Acesse http://localhost:8000
```

## Uso Pessoal / Educacional

Este projeto foi desenvolvido para fins didáticos e uso pessoal. Não é recomendado para aplicações em produção com dados sensíveis, pois as chaves de API residem no cliente.
