(function () {
  const STORAGE_KEY = 'theme';
  const ICON_DARK = '☾';
  const ICON_LIGHT = '☀';

  const root = document.documentElement;
  const mql = window.matchMedia('(prefers-color-scheme: dark)');

  const getStored = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return v === 'light' || v === 'dark' ? v : null;
    } catch (e) {
      return null;
    }
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      const icon = btn.querySelector('.theme-toggle__icon');
      if (icon) icon.textContent = theme === 'dark' ? ICON_LIGHT : ICON_DARK;
    }
  };

  const init = () => {
    apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
        apply(next);
      });
    }

    const onSystemChange = (e) => {
      if (getStored()) return;
      apply(e.matches ? 'dark' : 'light');
    };
    if (mql.addEventListener) mql.addEventListener('change', onSystemChange);
    else if (mql.addListener) mql.addListener(onSystemChange);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
