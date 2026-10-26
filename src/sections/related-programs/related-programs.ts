import Swiper from 'swiper';
import { A11y, Keyboard, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-related-programs]').forEach((section) => {
  const slider = section.querySelector<HTMLElement>('[data-related-programs-slider]');
  if (!slider) return;

  new Swiper(slider, {
    modules: [A11y, Keyboard, Navigation],
    slidesPerView: 'auto',
    centeredSlides: true,
    initialSlide: window.matchMedia('(max-width: 600px)').matches ? 0 : 1,
    spaceBetween: 10,
    watchOverflow: true,
    keyboard: { enabled: true, onlyInViewport: true },
    navigation: {
      prevEl: section.querySelector<HTMLButtonElement>('[data-slider-prev]'),
      nextEl: section.querySelector<HTMLButtonElement>('[data-slider-next]'),
    },
    a11y: {
      prevSlideMessage: section.querySelector<HTMLButtonElement>('[data-slider-prev]')?.ariaLabel ?? '',
      nextSlideMessage: section.querySelector<HTMLButtonElement>('[data-slider-next]')?.ariaLabel ?? '',
    },
  });
});
