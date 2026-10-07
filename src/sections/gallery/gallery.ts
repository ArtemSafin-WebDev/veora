import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((gallery) => {
  const slider = gallery.querySelector<HTMLElement>('.gallery__slider');
  const previous = gallery.querySelector<HTMLElement>('.gallery__arrow--prev');
  const next = gallery.querySelector<HTMLElement>('.gallery__arrow--next');
  if (!slider || !previous || !next) return;

  new Swiper(slider, {
    modules: [Navigation],
    slidesPerView: 'auto',
    navigation: { prevEl: previous, nextEl: next },
    breakpoints: { 0: { spaceBetween: 7 }, 601: { spaceBetween: 10 } },
  });
});
