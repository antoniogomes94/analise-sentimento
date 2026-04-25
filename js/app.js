document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('text-input');
  const btnAnalyze = document.getElementById('btn-analyze');
  const resultSection = document.getElementById('result-section');
  const errorSection = document.getElementById('error-section');
  const modelSelector = document.getElementById('model-selector');
  const container = document.querySelector('.container');

  const sentimentColors = {
    medo: '#ff6b6b',
    raiva: '#ff4500',
    tristeza: '#4a9eff',
    desespero: '#9d4edd',
    surpresa: '#ffd60a',
    alivio: '#2ea043',
    confusao: '#ff8c42',
    calma: '#52b788',
  };

  ModelsModule.init();

  ModelsModule.onModelChange(() => {
    updateAnalyzeButton();
  });

  textarea.addEventListener('input', () => {
    updateAnalyzeButton();
  });

  btnAnalyze.addEventListener('click', () => {
    runAnalysis();
  });

  const updateAnalyzeButton = () => {
    const model = ModelsModule.getSelectedModel();
    const hasText = textarea.value.trim().length > 0;
    btnAnalyze.disabled = !model || !hasText;

    const spinner = btnAnalyze.querySelector('.btn-analyze__spinner');
    const text = btnAnalyze.querySelector('.btn-analyze__text');
    spinner.hidden = true;
    text.textContent = 'Analisar';
  };

  const setState = (state, payload) => {
    const spinner = btnAnalyze.querySelector('.btn-analyze__spinner');
    const text = btnAnalyze.querySelector('.btn-analyze__text');

    if (state === 'loading') {
      btnAnalyze.disabled = true;
      text.textContent = 'Analisando...';
      spinner.hidden = false;
      if (!container.classList.contains('layout--split')) {
        resultSection.hidden = true;
      }
      errorSection.hidden = true;
    } else if (state === 'result') {
      btnAnalyze.disabled = false;
      text.textContent = 'Analisar';
      spinner.hidden = true;
      errorSection.hidden = true;
      resultSection.hidden = false;

      container.classList.add('layout--split');

      resultSection.classList.remove('result--animate');
      void resultSection.offsetWidth;
      resultSection.classList.add('result--animate');

      renderResult(payload.result, payload.model);

      if (window.innerWidth < 900) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (state === 'error') {
      btnAnalyze.disabled = false;
      text.textContent = 'Analisar';
      spinner.hidden = true;
      container.classList.remove('layout--split');
      resultSection.hidden = true;
      errorSection.hidden = false;
      document.getElementById('error-message').textContent = payload;
    }
  };

  const runAnalysis = async () => {
    const model = ModelsModule.getSelectedModel();
    const text = textarea.value.trim();

    if (!model) {
      setState('error', 'Selecione um modelo');
      return;
    }

    if (!text) {
      setState('error', 'Digite um texto para análise');
      return;
    }

    setState('loading');

    try {
      const result = await ApiClient.analyze(model, text);
      setState('result', { result, model });
    } catch (err) {
      setState('error', err.message);
    }
  };

  const renderResult = (result, model) => {
    const meta = document.getElementById('result-meta');
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    meta.textContent = `${model.providerName} - ${model.modelName} · ${timeStr}`;

    renderSentimentos(result.sentimentos);
    renderSummary(result);
    renderJson(result);
  };

  const renderSentimentos = (sentimentos) => {
    const grid = document.getElementById('sentiments-grid');
    grid.innerHTML = '';

    Object.entries(sentimentos).forEach(([name, value]) => {
      const item = document.createElement('div');
      item.className = 'sentiment-item';

      const label = document.createElement('div');
      label.className = 'sentiment-label';
      label.innerHTML = `<span>${capitalizeFirst(name)}</span><span class="sentiment-value">${(value * 100).toFixed(0)}%</span>`;

      const trackDiv = document.createElement('div');
      trackDiv.className = 'sentiment-bar-track';

      const fillDiv = document.createElement('div');
      fillDiv.className = 'sentiment-bar-fill';
      fillDiv.style.width = `${value * 100}%`;
      fillDiv.style.backgroundColor = sentimentColors[name] || '#888';

      trackDiv.appendChild(fillDiv);
      item.appendChild(label);
      item.appendChild(trackDiv);
      grid.appendChild(item);
    });
  };

  const renderSummary = (result) => {
    const summary = document.getElementById('result-summary');
    summary.innerHTML = '';

    const dominantRow = document.createElement('div');
    dominantRow.className = 'summary-row';
    dominantRow.innerHTML = `
      <span class="summary-label">Sentimento Dominante</span>
      <span class="summary-badge">${capitalizeFirst(result.sentimento_dominante)}</span>
    `;
    summary.appendChild(dominantRow);

    const valenciaRow = document.createElement('div');
    valenciaRow.className = 'summary-row';
    let valenciaClass = '';
    if (result.valencia === 'positivo') valenciaClass = '';
    else if (result.valencia === 'negativo') valenciaClass = 'negative';
    else if (result.valencia === 'neutro') valenciaClass = 'neutral';
    else if (result.valencia === 'misto') valenciaClass = 'mixed';

    valenciaRow.innerHTML = `
      <span class="summary-label">Valência</span>
      <span class="summary-badge ${valenciaClass}">${capitalizeFirst(result.valencia)}</span>
    `;
    summary.appendChild(valenciaRow);

    const intensidadeRow = document.createElement('div');
    intensidadeRow.className = 'summary-row';
    intensidadeRow.innerHTML = `
      <span class="summary-label">Intensidade Geral</span>
      <div class="summary-intensity">
        <div class="summary-intensity-fill" style="width: ${result.intensidade_geral * 100}%"></div>
      </div>
      <span class="summary-confidence">${(result.intensidade_geral * 100).toFixed(0)}%</span>
    `;
    summary.appendChild(intensidadeRow);

    const confiancaRow = document.createElement('div');
    confiancaRow.className = 'summary-row';
    confiancaRow.innerHTML = `
      <span class="summary-label">Confiabilidade</span>
      <span class="summary-confidence">${(result.confiabilidade_analise * 100).toFixed(0)}%</span>
    `;
    summary.appendChild(confiancaRow);

    const justRow = document.createElement('div');
    justRow.innerHTML = `
      <div style="margin-bottom: 0.5rem; font-weight: 500; color: var(--text-secondary); font-size: 0.85rem;">Justificativa</div>
      <p class="summary-justificativa">${escapeHtml(result.justificativa)}</p>
    `;
    summary.appendChild(justRow);
  };

  const renderJson = (result) => {
    document.getElementById('raw-json-output').textContent = JSON.stringify(result, null, 2);
  };

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const escapeHtml = (text) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  updateAnalyzeButton();
});
