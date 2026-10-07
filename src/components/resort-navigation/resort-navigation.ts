import { getModal } from '../modal/modal';

document.querySelectorAll<HTMLElement>('[data-resort-navigation]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-resort-navigation-form]');
  const desktop = root.querySelector<HTMLElement>('[data-resort-navigation-desktop]');
  const mobile = root.querySelector<HTMLElement>('[data-resort-navigation-mobile]');
  const dialog = root.querySelector<HTMLDialogElement>('dialog');
  if (!form || !desktop || !mobile || !dialog) return;

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
    root.dispatchEvent(new CustomEvent('resort-navigation:change', { bubbles: true, detail: { resort } }));
  };
  form.addEventListener('change', selectResort);
  form.addEventListener('submit', (event) => event.preventDefault());
});
