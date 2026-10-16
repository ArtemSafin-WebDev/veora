import Swiper from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-related-events-slider]').forEach((slider) => {
  const mobile = window.matchMedia('(max-width: 900px)');
  let swiper: Swiper | undefined;

  const sync = () => {
    if (mobile.matches && !swiper) {
      swiper = new Swiper(slider, {
        modules: [A11y, Keyboard],
        slidesPerView: 'auto',
        spaceBetween: 8,
        watchOverflow: true,
        keyboard: { enabled: true, onlyInViewport: true },
      });
    } else if (!mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
    }
  };

  sync();
  mobile.addEventListener('change', sync);
});
