document.querySelectorAll<HTMLElement>('[data-accordion]').forEach((root) => {
  const toggle = root.querySelector<HTMLButtonElement>('[data-accordion-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-accordion-panel]');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('accordion--open', open);
    panel.inert = !open;
  });
});
