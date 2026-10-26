document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((root) => {
  const toggle = root.querySelector<HTMLButtonElement>('[data-accordion-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-accordion-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle(root.dataset.accordionClass || 'accordion--open', open);
    panel.inert = !open;
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  if (root.hasAttribute('data-accordion-mobile-open')) {
    const mobile = window.matchMedia('(max-width: 600px)');
    setOpen(mobile.matches);
    mobile.addEventListener('change', () => setOpen(mobile.matches));
  }
});
