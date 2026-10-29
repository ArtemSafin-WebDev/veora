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
});
