document.querySelectorAll<HTMLElement>('[data-search-results]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-search-categories]');
  if (!form) return;
  const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
  const cards = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-search-result-category]'));
  const empty = root.querySelector<HTMLElement>('.search-results__empty');
  const parameter = form.dataset.searchCategoryParam ?? 'category';

  const filter = (category: string) => {
    inputs.forEach((input) => { input.checked = input.value === category; });
    cards.forEach((card) => { card.hidden = category !== 'all' && card.dataset.searchResultCategory !== category; });
    if (empty) empty.hidden = cards.some((card) => !card.hidden);
  };
  const syncLocation = () => {
    const requested = new URL(window.location.href).searchParams.get(parameter);
    filter(inputs.find((input) => input.value === requested)?.value ?? inputs[0]?.value ?? 'all');
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('change', () => {
    const category = String(new FormData(form).get(parameter) ?? 'all');
    const url = new URL(window.location.href);
    if (category === 'all') url.searchParams.delete(parameter);
    else url.searchParams.set(parameter, category);
    window.history.pushState(null, '', url);
    filter(category);
  });
  window.addEventListener('popstate', syncLocation);
  syncLocation();
});
