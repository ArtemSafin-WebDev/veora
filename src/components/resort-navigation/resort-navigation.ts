import { getModal } from '../modal/modal';

document.querySelectorAll<HTMLElement>('[data-resort-navigation]').forEach((root) => {
  const form = root.querySelector<HTMLElement>('[data-resort-navigation-form]');
  const desktop = root.querySelector<HTMLElement>('[data-resort-navigation-desktop]');
  const mobile = root.querySelector<HTMLElement>('[data-resort-navigation-mobile]');
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

  const parameter = root.dataset.navigationParam;
  if (parameter) {
    const links = Array.from(form.querySelectorAll<HTMLAnchorElement>('[data-navigation-value]'));
    const syncCategory = () => {
      const requested = new URL(window.location.href).searchParams.get(parameter) ?? 'all';
      const selected = links.find((link) => link.dataset.navigationValue === requested) ?? links[0];
      links.forEach((link) => {
        if (link === selected) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
      root.dispatchEvent(new CustomEvent('resort-navigation:change', {
        bubbles: true, detail: { resort: selected?.dataset.navigationValue ?? 'all' },
      }));
    };
    form.addEventListener('click', (event) => {
      if (!(event instanceof MouseEvent) || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('[data-navigation-value]') : null;
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      event.preventDefault();
      if (url.href !== window.location.href) window.history.pushState(null, '', url);
      syncCategory();
      if (dialog.open) void modal.close();
    });
    window.addEventListener('popstate', syncCategory);
    // Catalog listeners are installed after this module during startup.
    queueMicrotask(syncCategory);
    return;
  }
  if (!(form instanceof HTMLFormElement)) return;

  const selectResort = () => {
    const resort = String(new FormData(form).get('resort') ?? 'all');
    root.dispatchEvent(new CustomEvent('resort-navigation:change', { bubbles: true, detail: { resort } }));
  };
  form.addEventListener('change', selectResort);
  form.addEventListener('submit', (event) => event.preventDefault());
});
