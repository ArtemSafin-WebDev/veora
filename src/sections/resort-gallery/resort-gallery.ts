import Swiper from 'swiper';
import { A11y, EffectFade, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-resort-gallery]').forEach((gallery) => {
  const slider = gallery.querySelector<HTMLElement>('.resort-gallery__slider');
  const current = gallery.querySelector<HTMLElement>('[data-resort-gallery-current]');
  if (!slider || !current) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const swiper = new Swiper(slider, {
    modules: [A11y, EffectFade, Navigation],
    slidesPerView: 1,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    speed: reducedMotion.matches ? 0 : 300,
    navigation: {
      prevEl: gallery.querySelector<HTMLElement>('[data-slider-prev]'),
      nextEl: gallery.querySelector<HTMLElement>('[data-slider-next]'),
    },
    a11y: {
      prevSlideMessage: gallery.querySelector('[data-slider-prev]')?.getAttribute('aria-label') ?? '',
      nextSlideMessage: gallery.querySelector('[data-slider-next]')?.getAttribute('aria-label') ?? '',
      slideLabelMessage: '{{index}} / {{slidesLength}}',
    },
    on: {
      slideChange(instance) {
        current.textContent = String(instance.realIndex + 1).padStart(2, '0');
      },
    },
  });

  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); swiper.slidePrev(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); swiper.slideNext(); }
  });
  reducedMotion.addEventListener('change', () => {
    swiper.params.speed = reducedMotion.matches ? 0 : 300;
  });
});
