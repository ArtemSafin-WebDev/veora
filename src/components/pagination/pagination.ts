document.querySelectorAll<HTMLElement>('[data-pagination]').forEach((root) => {
  const total = Number(root.dataset.totalPages);
  const requested = Number(new URL(window.location.href).searchParams.get('page'));
  const current = requested >= 1 && requested <= total ? Math.floor(requested) : Number(root.dataset.currentPage);
  root.dataset.currentPage = String(current);
  const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-page]'));
  // Include the current page even if it falls in the abbreviated range.
  if (!links.some((link) => Number(link.dataset.page) === current)) {
    const nearest = links.reduce((a, b) => Math.abs(Number(a.dataset.page) - current) < Math.abs(Number(b.dataset.page) - current) ? a : b);
    nearest.dataset.page = String(current);
    nearest.textContent = String(current);
  }
  links.forEach((link) => {
    const active = Number(link.dataset.page) === current;
    link.classList.toggle('pagination__link--current', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
    const url = new URL(link.href);
    url.search = window.location.search;
    url.searchParams.set('page', link.dataset.page ?? '1');
    link.href = url.href;
  });
  root.querySelectorAll<HTMLAnchorElement>('[data-page-ellipsis]').forEach((link) => {
    const previous = link.previousElementSibling as HTMLElement | null;
    const page = Math.min(total, Number(previous?.dataset.page ?? 0) + 1);
    const url = new URL(link.href);
    url.search = window.location.search;
    url.searchParams.set('page', String(page));
    link.href = url.href;
    link.setAttribute('aria-label', `${link.dataset.pageLabel} ${page}`);
  });
  root.querySelectorAll<HTMLAnchorElement>('[data-page-step]').forEach((link) => {
    const page = current + Number(link.dataset.pageStep);
    const disabled = page < 1 || page > total;
    link.setAttribute('aria-disabled', String(disabled));
    link.tabIndex = disabled ? -1 : 0;
    const url = new URL(link.href);
    url.search = window.location.search;
    url.searchParams.set('page', String(Math.max(1, Math.min(total, page))));
    link.href = url.href;
    link.addEventListener('click', (event) => { if (disabled) event.preventDefault(); });
  });
});
