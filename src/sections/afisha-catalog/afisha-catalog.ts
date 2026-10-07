document.querySelectorAll<HTMLElement>('[data-afisha-catalog]').forEach((grid) => {
  const catalog = grid.closest<HTMLElement>('[data-catalog-layout]');
  if (!catalog) return;

  const archive = new URL(window.location.href).searchParams.get('archive') === '1';
  const action = document.querySelector<HTMLAnchorElement>('[data-banner-archive]');
  if (action && archive) {
    action.textContent = action.dataset.upcomingLabel ?? action.textContent;
    const url = new URL(action.href);
    url.searchParams.delete('archive');
    url.searchParams.delete('page');
    action.href = url.href;
  }

  const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-catalog-resorts]'));
  const update = (resort = 'all') => {
    cards.forEach((card) => {
      const resorts = card.dataset.catalogResorts?.split(' ') ?? [];
      const matchesResort = resort === 'all' || resorts.includes('all') || resorts.includes(resort);
      card.hidden = !matchesResort || (card.dataset.catalogArchived === 'true') !== archive;
    });
    const hasCards = cards.some((card) => !card.hidden);
    const empty = grid.querySelector<HTMLElement>('[data-catalog-empty]');
    if (empty) {
      empty.hidden = hasCards;
      empty.textContent = (archive ? grid.dataset.archiveEmptyLabel : grid.dataset.emptyLabel) ?? '';
    }
    const pagination = catalog.querySelector<HTMLElement>('[data-pagination]');
    if (pagination) pagination.hidden = !hasCards || resort !== 'all';
  };

  update();
  catalog.addEventListener('resort-navigation:change', (event) => {
    update((event as CustomEvent<{ resort: string }>).detail.resort);
  });
});
