import Swiper from 'swiper';
import { A11y, EffectFade, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-dining-gallery]').forEach((gallery) => {
  const slider = gallery.querySelector<HTMLElement>('.dining-menus__slider');
  if (!slider) return;

  new Swiper(slider, {
    modules: [A11y, EffectFade, Navigation],
    slidesPerView: 1,
    loop: false,
    watchOverflow: true,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300,
    navigation: {
      prevEl: gallery.querySelector<HTMLElement>('[data-slider-prev]'),
      nextEl: gallery.querySelector<HTMLElement>('[data-slider-next]'),
    },
    a11y: {
      prevSlideMessage: gallery.querySelector('[data-slider-prev]')?.getAttribute('aria-label') ?? '',
      nextSlideMessage: gallery.querySelector('[data-slider-next]')?.getAttribute('aria-label') ?? '',
      slideLabelMessage: '{{index}} / {{slidesLength}}',
    },
  });
});
