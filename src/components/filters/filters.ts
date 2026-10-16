import { getModal } from '../modal/modal';

/** One form is moved between the desktop column and dialog, preserving its state. */
document.querySelectorAll<HTMLElement>('[data-filters]').forEach((root) => {
  const form = root.querySelector<HTMLFormElement>('[data-filters-form]');
  const desktop = root.querySelector<HTMLElement>('[data-filters-desktop]');
  const mobile = root.querySelector<HTMLElement>('[data-filters-mobile]');
  const dialog = root.querySelector<HTMLDialogElement>('dialog');
  if (!form || !desktop || !mobile || !dialog) return;
  const breakpoint = window.matchMedia('(max-width: 900px)');
  const modal = getModal(dialog);
  const syncLayout = () => {
    if (!breakpoint.matches && dialog.open) void modal.close();
    (breakpoint.matches ? mobile : desktop).append(form);
  };
  syncLayout();
  breakpoint.addEventListener('change', syncLayout);

  form.querySelectorAll<HTMLElement>('[data-filter-group]').forEach((group) => {
    const toggle = group.querySelector<HTMLButtonElement>('[data-filter-toggle]');
    const panel = group.querySelector<HTMLElement>('.filters__panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      group.classList.toggle('filters__group--open', open);
      panel.inert = !open;
    });
  });

  const notify = () => {
    const values = Object.fromEntries(Array.from(new Set(Array.from(form.elements).filter((el): el is HTMLInputElement => el instanceof HTMLInputElement).map((el) => el.name))).map((name) => [name, new FormData(form).getAll(name)]));
    root.dispatchEvent(new CustomEvent('filters:change', { bubbles: true, detail: { values } }));
  };
  form.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    const siblings = Array.from(form.querySelectorAll<HTMLInputElement>('input')).filter((item) => item.name === input.name && item !== input);
    if (input.checked) siblings.forEach((item) => {
      if (input.hasAttribute('data-filter-all') || item.hasAttribute('data-filter-all')) item.checked = false;
    });
    notify();
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); notify(); });
});
