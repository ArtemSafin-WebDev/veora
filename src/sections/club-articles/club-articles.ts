import Swiper from 'swiper';
import { A11y, Keyboard, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-club-articles]').forEach((section) => {
  const slider = section.querySelector<HTMLElement>('[data-club-articles-slider]');
  if (!slider) return;
  const mobile = window.matchMedia('(max-width: 600px)');
  let swiper: Swiper | undefined;
  const sync = () => {
    if (mobile.matches && !swiper) {
      swiper = new Swiper(slider, {
        modules: [A11y, Keyboard, Navigation],
        slidesPerView: 'auto',
        spaceBetween: 8,
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
        navigation: {
          prevEl: section.querySelector<HTMLElement>('[data-slider-prev]'),
          nextEl: section.querySelector<HTMLElement>('[data-slider-next]'),
        },
      });
    } else if (!mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
    }
  };
  mobile.addEventListener('change', sync);
  sync();
});
