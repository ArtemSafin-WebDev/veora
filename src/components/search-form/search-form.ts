document.querySelectorAll<HTMLFormElement>('[data-search-form]').forEach((form) => {
  const input = form.querySelector<HTMLInputElement>('input[type="search"]');
  if (!input) return;

  const query = new URL(window.location.href).searchParams.get(input.name);
  if (query !== null) input.value = query;
});
