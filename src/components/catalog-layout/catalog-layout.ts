document.querySelectorAll<HTMLElement>('[data-catalog-layout]').forEach((catalog) => {
  catalog.addEventListener('resort-navigation:change', (event) => {
    const { resort } = (event as CustomEvent<{ resort: string }>).detail;
    const cards = Array.from(catalog.querySelectorAll<HTMLElement>('[data-catalog-resorts]'));
    cards.forEach((card) => {
      const resorts = card.dataset.catalogResorts?.split(' ') ?? [];
      card.hidden = resort !== 'all' && !resorts.includes('all') && !resorts.includes(resort);
    });
    const empty = catalog.querySelector<HTMLElement>('[data-catalog-empty]');
    if (empty) empty.hidden = cards.some((card) => !card.hidden);
    const pagination = catalog.querySelector<HTMLElement>('[data-pagination]');
    if (pagination) pagination.hidden = resort !== 'all';
  });
});
