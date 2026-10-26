document.querySelectorAll<HTMLElement>('[data-infinite-gallery]').forEach((gallery) => {
  const track = gallery.querySelector<HTMLElement>('[data-infinite-gallery-track]');
  const group = gallery.querySelector<HTMLElement>('[data-infinite-gallery-group]');
  if (!track || !group) return;

  const mobile = window.matchMedia('(max-width: 600px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cycle = 0;
  let frame = 0;
  let lastTime = 0;
  let pendingDistance = 0;
  let resumeAt = 0;
  let inView = false;
  let pointerId: number | null = null;
  let lastX = 0;
  let mouseDrag = false;
  const copies: HTMLElement[] = [];

  const wrap = () => {
    if (!cycle) return;
    // Keep the viewport in the middle copy, preserving the exact visible position.
    if (gallery.scrollLeft < cycle || gallery.scrollLeft >= cycle * 2) {
      gallery.scrollLeft = cycle + ((gallery.scrollLeft % cycle) + cycle) % cycle;
    }
  };

  const tick = (time: number) => {
    if (lastTime && inView && !document.hidden && !reducedMotion.matches && pointerId === null && time > resumeAt) {
      // Browsers may round scrollLeft to whole pixels. Accumulate subpixel travel
      // so the slow marquee keeps moving at high refresh rates as well.
      pendingDistance += Math.min(time - lastTime, 64) * .028;
      const distance = Math.floor(pendingDistance);
      if (distance) {
        gallery.scrollLeft += distance;
        pendingDistance -= distance;
        wrap();
      }
    }
    lastTime = time;
    frame = requestAnimationFrame(tick);
  };

  const sync = () => {
    cancelAnimationFrame(frame);
    copies.forEach((copy) => copy.remove());
    copies.length = 0;
    cycle = 0;
    lastTime = 0;
    pendingDistance = 0;
    pointerId = null;
    mouseDrag = false;
    gallery.classList.remove('infinite-gallery--dragging');
    if (!mobile.matches) {
      gallery.scrollLeft = 0;
      gallery.removeAttribute('tabindex');
      return;
    }
    gallery.tabIndex = 0;
    for (let index = 0; index < 2; index++) {
      const copy = group.cloneNode(true) as HTMLElement;
      copy.setAttribute('aria-hidden', 'true');
      copy.querySelectorAll('img').forEach((img) => { img.alt = ''; });
      track.append(copy);
      copies.push(copy);
    }
    cycle = group.getBoundingClientRect().width;
    const slide = group.firstElementChild?.getBoundingClientRect().width ?? 0;
    const second = group.children[1] as HTMLElement | undefined;
    gallery.scrollLeft = cycle + (second?.offsetLeft ?? 0) - group.offsetLeft - (gallery.clientWidth - slide) / 2;
    frame = requestAnimationFrame(tick);
  };

  gallery.addEventListener('pointerdown', (event) => {
    if (!mobile.matches || !event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    mouseDrag = event.pointerType === 'mouse';
    if (mouseDrag) {
      gallery.setPointerCapture(event.pointerId);
      gallery.classList.add('infinite-gallery--dragging');
      event.preventDefault();
    }
  });
  gallery.addEventListener('pointermove', (event) => {
    if (pointerId !== event.pointerId || !mouseDrag) return;
    gallery.scrollLeft += lastX - event.clientX;
    lastX = event.clientX;
    wrap();
  });
  const release = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    mouseDrag = false;
    resumeAt = performance.now() + 1400;
    gallery.classList.remove('infinite-gallery--dragging');
  };
  gallery.addEventListener('pointerup', release);
  gallery.addEventListener('pointercancel', release);
  gallery.addEventListener('lostpointercapture', release);
  gallery.addEventListener('scroll', wrap, { passive: true });
  gallery.addEventListener('wheel', () => { resumeAt = performance.now() + 1400; }, { passive: true });
  gallery.addEventListener('keydown', (event) => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    gallery.scrollLeft += (group.getBoundingClientRect().width / group.children.length) * (event.key === 'ArrowLeft' ? -1 : 1);
    resumeAt = performance.now() + 1400;
    wrap();
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(gallery);
  new ResizeObserver(() => {
    if (mobile.matches && cycle) {
      const progress = gallery.scrollLeft / cycle;
      cycle = group.getBoundingClientRect().width;
      gallery.scrollLeft = progress * cycle;
      wrap();
    }
  }).observe(gallery);
  mobile.addEventListener('change', sync);
  sync();
});
