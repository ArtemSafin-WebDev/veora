import Swiper from 'swiper';
import { A11y, Keyboard, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-dining-extras]').forEach((section) => {
  const slider = section.querySelector<HTMLElement>('[data-dining-extras-slider]');
  if (!slider) return;

  new Swiper(slider, {
    modules: [A11y, Keyboard, Navigation],
    slidesPerView: 'auto',
    spaceBetween: 8,
    breakpoints: { 601: { spaceBetween: 10 } },
    loop: false,
    watchOverflow: true,
    speed: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: section.querySelector<HTMLElement>('[data-slider-prev]'),
      nextEl: section.querySelector<HTMLElement>('[data-slider-next]'),
    },
    a11y: {
      prevSlideMessage: section.querySelector('[data-slider-prev]')?.getAttribute('aria-label') ?? '',
      nextSlideMessage: section.querySelector('[data-slider-next]')?.getAttribute('aria-label') ?? '',
      slideLabelMessage: '{{index}} / {{slidesLength}}',
    },
  });
});
