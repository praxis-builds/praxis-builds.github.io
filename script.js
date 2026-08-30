(() => {
  const process = document.querySelector('[data-process]');
  if (process) {
    const tabs = [...process.querySelectorAll('[role="tab"]')];
    const panels = [...process.querySelectorAll('[role="tabpanel"]')];

    const activateTab = (tab, focus = false) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
        else next = (index - 1 + tabs.length) % tabs.length;
        activateTab(tabs[next], true);
      });
    });
  }

  const form = document.querySelector('#inquiry-form');
  const status = document.querySelector('#form-status');
  if (!form || !status) return;

  const clearErrors = () => {
    form.querySelectorAll('.field-error').forEach((error) => error.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const invalid = [...form.querySelectorAll('input, select, textarea')].filter((field) => !field.checkValidity());

    invalid.forEach((field) => {
      field.setAttribute('aria-invalid', 'true');
      const message = document.createElement('p');
      message.className = 'field-error';
      message.id = `${field.id}-error`;
      message.textContent = field.validity.typeMismatch ? 'Enter a valid email address.' : field.validity.tooShort ? 'Please add a little more detail (at least 20 characters).' : 'Please complete this field.';
      field.setAttribute('aria-describedby', message.id);
      field.insertAdjacentElement('afterend', message);
    });

    if (invalid.length) {
      status.textContent = 'Please complete the highlighted fields before reviewing your request.';
      status.classList.remove('is-ready');
      invalid[0].focus();
      return;
    }

    status.textContent = 'Your project details look complete. Online submission is still being connected, so nothing has been sent. Please use the GitHub contact link below for now.';
    status.classList.add('is-ready');
    status.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
})();
