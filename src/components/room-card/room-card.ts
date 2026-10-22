import Swiper from 'swiper';
import { A11y, EffectFade, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-room-gallery]').forEach((gallery) => {
  const slider = gallery.querySelector<HTMLElement>('.room-card__slider');
  if (!slider) return;
  const previous = gallery.querySelector<HTMLElement>('[data-slider-prev]');
  const next = gallery.querySelector<HTMLElement>('[data-slider-next]');

  new Swiper(slider, {
    modules: [A11y, EffectFade, Navigation],
    slidesPerView: 1,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    watchOverflow: true,
    a11y: {
      prevSlideMessage: previous?.getAttribute('aria-label') ?? undefined,
      nextSlideMessage: next?.getAttribute('aria-label') ?? undefined,
    },
    navigation: {
      prevEl: previous,
      nextEl: next,
    },
  });
});
