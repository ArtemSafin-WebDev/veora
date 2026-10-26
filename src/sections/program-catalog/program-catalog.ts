document.querySelectorAll<HTMLElement>('.program-catalog').forEach((catalog) => {
  const cards = Array.from(catalog.querySelectorAll<HTMLElement>('[data-program-card]'));
  const empty = catalog.querySelector<HTMLElement>('.program-catalog__empty');

  catalog.addEventListener('filters:change', (event) => {
    const { values } = (event as CustomEvent<{ values: Record<string, string[]> }>).detail;
    const durations = (values.duration ?? []).filter((value) => value !== 'all').map(Number);
    const types = (values.type ?? []).filter((value) => value !== 'all');

    cards.forEach((card) => {
      const minDays = Number(card.dataset.programMinDays);
      const cardTypes = card.dataset.programTypes?.split(' ') ?? [];
      const matchesDuration = !durations.length || durations.some((days) => days >= minDays);
      const matchesType = !types.length || types.some((type) => cardTypes.includes(type));
      card.hidden = !matchesDuration || !matchesType;
    });

    if (empty) empty.hidden = cards.some((card) => !card.hidden);
  });
});
