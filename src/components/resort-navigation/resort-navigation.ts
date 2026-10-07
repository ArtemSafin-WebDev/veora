import { getModal } from '../modal/modal';

document.querySelectorAll<HTMLElement>('[data-resort-navigation]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-resort-navigation-form]');
  const desktop = root.querySelector<HTMLElement>('[data-resort-navigation-desktop]');
  const mobile = root.querySelector<HTMLElement>('[data-resort-navigation-mobile]');
  const dialog = root.querySelector<HTMLDialogElement>('dialog');
  const catalog = root.closest<HTMLElement>('[data-offer-catalog]');
  if (!form || !desktop || !mobile || !dialog || !catalog) return;

  const breakpoint = window.matchMedia('(max-width: 600px)');
  const modal = getModal(dialog);
  const syncLayout = () => {
    if (!breakpoint.matches && dialog.open) void modal.close();
    (breakpoint.matches ? mobile : desktop).append(form);
  };
  syncLayout();
  breakpoint.addEventListener('change', syncLayout);

  const selectResort = () => {
    const resort = String(new FormData(form).get('resort') ?? 'all');
    catalog.querySelectorAll<HTMLElement>('[data-offer-resorts]').forEach((card) => {
      const resorts = card.dataset.offerResorts?.split(' ') ?? [];
      card.hidden = resort !== 'all' && !resorts.includes('all') && !resorts.includes(resort);
    });
    // Pagination keeps its normal links when a server supplies the remaining pages.
    const pagination = catalog.querySelector<HTMLElement>('[data-pagination]');
    if (pagination) pagination.hidden = resort !== 'all';
  };
  form.addEventListener('change', selectResort);
  form.addEventListener('submit', (event) => event.preventDefault());
});
