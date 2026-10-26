document.querySelectorAll<HTMLElement>('.additional-services-catalog').forEach((catalog) => {
  const cards = Array.from(catalog.querySelectorAll<HTMLElement>('[data-service-filters]')).map((element) => ({
    element,
    filters: JSON.parse(element.dataset.serviceFilters ?? '{}') as Record<string, string[]>,
  }));
  const empty = catalog.querySelector<HTMLElement>('.additional-services-catalog__empty');

  catalog.addEventListener('filters:change', (event) => {
    const { values } = (event as CustomEvent<{ values: Record<string, string[]> }>).detail;

    cards.forEach(({ element, filters }) => {
      element.hidden = !Object.entries(values).every(([group, selected]) => {
        const active = selected.filter((value) => value !== 'all');
        return !active.length || active.some((value) => filters[group]?.includes(value));
      });
    });

    if (empty) empty.hidden = cards.some(({ element }) => !element.hidden);
  });
});
