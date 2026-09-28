type ResortPopover = {
  pin: HTMLButtonElement;
  dot: HTMLImageElement;
  popover: HTMLElement;
};

document.querySelectorAll<HTMLElement>('[data-resorts]').forEach((section) => {
  const viewport = section.querySelector<HTMLElement>('[data-resorts-viewport]');
  if (!viewport) return;

  const modes = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-resorts-mode]'));
  const filters = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-resorts-filter]'));
  const pins = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-resort-pin]'));
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-resort-card]'));
  const nativePopover = typeof HTMLElement.prototype.showPopover === 'function';
  const nativeAnchor = CSS.supports('anchor-name: --resort')
    && CSS.supports('left: anchor(center)')
    && CSS.supports('position-try-fallbacks: flip-block');
  let active: ResortPopover | undefined;
  let frame = 0;

  const closePopover = (restoreFocus = false) => {
    if (!active) return;
    const { pin, popover } = active;
    active = undefined;
    pin.setAttribute('aria-expanded', 'false');
    if (nativePopover) popover.hidePopover();
    else popover.classList.remove('resort-popover--legacy-open');
    if (restoreFocus) pin.focus({ preventScroll: true });
  };

  const positionPopover = () => {
    if (!active) return;
    const { dot, popover } = active;
    const point = dot.getBoundingClientRect();
    const clip = viewport.getBoundingClientRect();
    const visual = window.visualViewport;
    const viewLeft = visual?.offsetLeft ?? 0;
    const viewTop = visual?.offsetTop ?? 0;
    const viewWidth = visual?.width ?? document.documentElement.clientWidth;
    const viewHeight = visual?.height ?? window.innerHeight;
    const center = point.left + point.width / 2;

    // A popover must not remain detached when its point leaves the scrolling map.
    if (center < Math.max(clip.left, viewLeft) || center > Math.min(clip.right, viewLeft + viewWidth)
      || point.bottom < viewTop || point.top > viewTop + viewHeight) {
      closePopover();
      return;
    }
    if (nativePopover && nativeAnchor) return;

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gutter = 1.2 * rem;
    const gap = .7 * rem;
    const box = popover.getBoundingClientRect();
    const left = Math.max(viewLeft + gutter, Math.min(center - box.width / 2, viewLeft + viewWidth - box.width - gutter));
    const above = point.top - gap - box.height;
    const below = point.bottom + gap;
    const preferredTop = above >= viewTop + gutter ? above : below;
    const top = Math.max(viewTop + gutter, Math.min(preferredTop, viewTop + viewHeight - box.height - gutter));
    popover.style.setProperty('--popover-left', `${left / rem}rem`);
    popover.style.setProperty('--popover-top', `${top / rem}rem`);
  };

  const schedulePosition = () => {
    if (!active || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      positionPopover();
    });
  };

  const resizeObserver = new ResizeObserver(schedulePosition);
  resizeObserver.observe(viewport);

  pins.forEach((pin) => {
    const popover = document.getElementById(pin.getAttribute('popovertarget') ?? '');
    const dot = pin.querySelector<HTMLImageElement>('.resorts__pin-dot');
    if (!popover || !dot) return;
    const entry = { pin, dot, popover };

    popover.classList.toggle('resort-popover--fallback', !nativePopover || !nativeAnchor);
    popover.classList.toggle('resort-popover--legacy', !nativePopover);
    resizeObserver.observe(popover);

    pin.addEventListener('click', (event) => {
      // Keep one controller for native popovers and older Safari without the API.
      event.preventDefault();
      const wasOpen = active === entry;
      closePopover();
      if (wasOpen) return;

      active = entry;
      pin.setAttribute('aria-expanded', 'true');
      if (nativePopover) popover.showPopover();
      else popover.classList.add('resort-popover--legacy-open');
      positionPopover();
      if (event.detail === 0 && active) popover.querySelector<HTMLButtonElement>('[data-popover-close]')?.focus({ preventScroll: true });
    });

    // Native light-dismiss also needs to reset the point's visual/accessible state.
    popover.addEventListener('beforetoggle', (event) => {
      if ((event as ToggleEvent).newState === 'closed') {
        pin.setAttribute('aria-expanded', 'false');
        if (active === entry) active = undefined;
      }
    });
    popover.querySelector('[data-popover-close]')?.addEventListener('click', (event) => {
      event.preventDefault();
      closePopover(true);
    });
  });

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      closePopover();
      const category = filter.dataset.resortsFilter;
      filters.forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
      cards.forEach((card) => { card.hidden = category !== 'all' && card.dataset.category !== category; });
      const visibleGroups = new Set<string>();
      pins.forEach((pin) => {
        const group = pin.dataset.pinGroup ?? '';
        const matches = category === 'all' || pin.dataset.category === category;
        pin.hidden = !matches || visibleGroups.has(group);
        if (!pin.hidden) visibleGroups.add(group);
      });
    });
  });

  const activateMode = (mode: HTMLButtonElement, focus = false) => {
    closePopover();
    modes.forEach((button) => {
      const selected = button === mode;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !selected;
    });
    if (focus) mode.focus();
  };

  modes.forEach((mode, index) => {
    mode.addEventListener('click', () => activateMode(mode));
    mode.addEventListener('keydown', (event) => {
      let next: number;
      if (event.key === 'ArrowRight') next = (index + 1) % modes.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + modes.length) % modes.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = modes.length - 1;
      else return;
      event.preventDefault();
      activateMode(modes[next], true);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) {
      event.preventDefault();
      closePopover(true);
    }
  });
  if (!nativePopover) {
    document.addEventListener('pointerdown', (event) => {
      if (active && event.target instanceof Node && !active.popover.contains(event.target) && !active.pin.contains(event.target)) closePopover();
    });
  }
  window.addEventListener('scroll', schedulePosition, { capture: true, passive: true });
  window.addEventListener('resize', schedulePosition, { passive: true });
  window.visualViewport?.addEventListener('resize', schedulePosition, { passive: true });
  window.visualViewport?.addEventListener('scroll', schedulePosition, { passive: true });
});
