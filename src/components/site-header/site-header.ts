const header = document.querySelector<HTMLElement>('[data-site-header]');

if (header) {
  const mobile = window.matchMedia('(max-width: 600px)');
  const toggles = Array.from(header.querySelectorAll<HTMLButtonElement>('[data-header-toggle]'));
  const panels = Array.from(header.querySelectorAll<HTMLElement>('[data-header-panel]'));
  const accordions = Array.from(header.querySelectorAll<HTMLElement>('[data-header-accordion]'));
  const backdrop = header.querySelector<HTMLElement>('[data-header-backdrop]')!;
  const bar = header.querySelector<HTMLElement>('.site-header__bar')!;
  const menuNavigation = header.querySelector<HTMLElement>('.site-header__menu-navigation')!;
  const background = Array.from(document.querySelectorAll<HTMLElement>('body > main, body > footer'));
  let active: string | undefined;
  let opener: HTMLButtonElement | undefined;
  let savedInert: boolean[] = [];

  const setAccordion = (selected?: HTMLElement) => {
    accordions.forEach((accordion) => {
      const expanded = accordion === selected;
      const toggle = accordion.querySelector<HTMLButtonElement>('[data-accordion-toggle]')!;
      const panel = accordion.querySelector<HTMLElement>('.site-header__accordion-panel')!;
      accordion.classList.toggle('site-header__accordion--open', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      panel.inert = mobile.matches && !expanded;
    });
    menuNavigation.classList.toggle('site-header__menu-navigation--expanded', Boolean(selected));
    menuNavigation.classList.toggle('site-header__menu-navigation--directions', Boolean(selected?.classList.contains('site-header__accordion--directions')));
  };

  const close = (restoreFocus = false) => {
    if (!active) return;
    active = undefined;
    panels.forEach((panel) => {
      panel.hidden = true;
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
    });
    bar.inert = false;
    toggles.forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'false');
      if (toggle.dataset.openLabel) toggle.setAttribute('aria-label', toggle.dataset.openLabel);
    });
    backdrop.hidden = true;
    document.documentElement.classList.remove('site-header-scroll-locked');
    document.body.classList.remove('site-header-scroll-locked');
    background.forEach((element, index) => { element.inert = savedInert[index]; });
    if (restoreFocus) opener?.focus();
    opener = undefined;
  };

  const open = (toggle: HTMLButtonElement, focusPanel = false) => {
    const name = toggle.dataset.headerToggle;
    if (active === name) { close(true); return; }
    close();
    const panel = panels.find((item) => item.dataset.headerPanel === name);
    if (!panel) return;
    active = name;
    opener = toggle;
    savedInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    document.documentElement.classList.add('site-header-scroll-locked');
    document.body.classList.add('site-header-scroll-locked');
    backdrop.hidden = false;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (toggle.dataset.closeLabel) toggle.setAttribute('aria-label', toggle.dataset.closeLabel);
    if (name === 'menu') setAccordion();
    if (mobile.matches && name === 'menu') {
      bar.inert = true;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      header.querySelector<HTMLButtonElement>('[data-header-close]')?.focus();
    }
    else if (focusPanel) panel.querySelector<HTMLElement>('a, button')?.focus();
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => open(toggle, event.detail === 0));
    toggle.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (active !== toggle.dataset.headerToggle) open(toggle, true);
      else panels.find((panel) => !panel.hidden)?.querySelector<HTMLElement>('a, button')?.focus();
    });
  });
  accordions.forEach((accordion) => {
    accordion.querySelector('[data-accordion-toggle]')?.addEventListener('click', () => {
      setAccordion(accordion.classList.contains('site-header__accordion--open') ? undefined : accordion);
    });
  });
  backdrop.addEventListener('click', () => close(true));
  header.querySelector('[data-header-close]')?.addEventListener('click', () => close(true));
  header.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) close();
  });
  document.addEventListener('keydown', (event) => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
    if (event.key !== 'Tab') return;
    const scope = mobile.matches && active === 'menu' ? document.getElementById('header-menu')! : header;
    const focusable = Array.from(scope.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((element) => element.getClientRects().length && !element.closest('[hidden], [inert]') && getComputedStyle(element).visibility !== 'hidden');
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  mobile.addEventListener('change', () => { close(); setAccordion(); });
  setAccordion();
}
