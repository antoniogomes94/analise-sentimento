window.ModelsModule = (() => {
  let selectedModel = null;
  let changeCallbacks = [];

  const init = () => {
    const dropdown = document.getElementById('model-dropdown');
    const trigger = document.getElementById('model-trigger');
    const hint = document.getElementById('model-hint');

    const models = window.MODELS || [];

    if (!models || models.length === 0) {
      const item = document.createElement('li');
      item.className = 'model-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-disabled', 'true');
      item.innerHTML = '<span class="model-option__name">Nenhum modelo configurado</span>';
      dropdown.appendChild(item);
      hint.textContent = 'Configure o arquivo models.config.js — veja models.config.example.js';
      return;
    }

    models.forEach((model) => {
      const item = document.createElement('li');
      item.className = 'model-option';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('data-model-id', model.id);
      item.innerHTML = `
        <span class="model-option__provider">${escapeHtml(model.providerName)}</span>
        <span class="model-option__name">${escapeHtml(model.modelName)}</span>
      `;
      item.addEventListener('click', () => selectModel(model, item));
      dropdown.appendChild(item);
    });

    trigger.addEventListener('click', () => toggleDropdown());
    document.addEventListener('click', (e) => {
      if (!document.getElementById('model-selector').contains(e.target)) {
        closeDropdown();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (trigger.getAttribute('aria-expanded') === 'true') {
        if (e.key === 'Escape') {
          closeDropdown();
          trigger.focus();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusNextOption();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusPrevOption();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const focused = dropdown.querySelector('[data-focused="true"]');
          if (focused) {
            const modelId = focused.getAttribute('data-model-id');
            const model = models.find((m) => m.id === modelId);
            if (model) selectModel(model, focused);
          }
        }
      }
    });
  };

  const toggleDropdown = () => {
    const trigger = document.getElementById('model-trigger');
    const dropdown = document.getElementById('model-dropdown');
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const openDropdown = () => {
    const trigger = document.getElementById('model-trigger');
    const dropdown = document.getElementById('model-dropdown');
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.removeAttribute('hidden');
  };

  const closeDropdown = () => {
    const trigger = document.getElementById('model-trigger');
    const dropdown = document.getElementById('model-dropdown');
    trigger.setAttribute('aria-expanded', 'false');
    dropdown.setAttribute('hidden', '');
    clearFocusedOption();
  };

  const selectModel = (model, item) => {
    selectedModel = model;
    const label = document.getElementById('model-trigger-label');
    label.textContent = `${model.providerName} - ${model.modelName}`;

    const allItems = document.querySelectorAll('.model-option');
    allItems.forEach((el) => {
      el.setAttribute('aria-selected', 'false');
    });
    item.setAttribute('aria-selected', 'true');

    closeDropdown();
    changeCallbacks.forEach((cb) => cb(model));
  };

  const focusNextOption = () => {
    const dropdown = document.getElementById('model-dropdown');
    const options = Array.from(dropdown.querySelectorAll('.model-option'));
    const focused = dropdown.querySelector('[data-focused="true"]');
    const currentIdx = focused ? options.indexOf(focused) : -1;
    const nextIdx = currentIdx + 1 < options.length ? currentIdx + 1 : 0;
    setFocusedOption(options[nextIdx]);
  };

  const focusPrevOption = () => {
    const dropdown = document.getElementById('model-dropdown');
    const options = Array.from(dropdown.querySelectorAll('.model-option'));
    const focused = dropdown.querySelector('[data-focused="true"]');
    const currentIdx = focused ? options.indexOf(focused) : 0;
    const prevIdx = currentIdx - 1 >= 0 ? currentIdx - 1 : options.length - 1;
    setFocusedOption(options[prevIdx]);
  };

  const setFocusedOption = (option) => {
    clearFocusedOption();
    option.setAttribute('data-focused', 'true');
    option.scrollIntoView({ block: 'nearest' });
  };

  const clearFocusedOption = () => {
    const focused = document.querySelector('[data-focused="true"]');
    if (focused) focused.removeAttribute('data-focused');
  };

  const getSelectedModel = () => selectedModel;

  const onModelChange = (callback) => {
    changeCallbacks.push(callback);
  };

  const escapeHtml = (text) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  return {
    init,
    getSelectedModel,
    onModelChange,
  };
})();
