import Swiper from 'swiper';
import { A11y, Navigation, Keyboard } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-event-media]').forEach((media) => {
  const slider = media.querySelector<HTMLElement>('.event-media__slider');
  if (!slider) return;
  const previous = media.querySelector<HTMLElement>('[data-slider-prev]');
  const next = media.querySelector<HTMLElement>('[data-slider-next]');

  new Swiper(slider, {
    modules: [A11y, Navigation, Keyboard],
    slidesPerView: 1,
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: {
      prevSlideMessage: previous?.getAttribute('aria-label') ?? '',
      nextSlideMessage: next?.getAttribute('aria-label') ?? '',
    },
    navigation: {
      prevEl: previous,
      nextEl: next,
    },
  });
});
