document.querySelectorAll<HTMLElement>('.voucher-card').forEach((card) => {
  card.querySelector('[data-voucher-programs]')?.addEventListener('click', () => {
    const toggle = card.querySelector<HTMLButtonElement>('[data-accordion-toggle]');
    if (toggle?.getAttribute('aria-expanded') !== 'true') toggle?.click();
    card.querySelector('[data-accordion-panel]')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
});
