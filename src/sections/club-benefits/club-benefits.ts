import Swiper from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-club-benefits-slider]').forEach((slider) => {
  const mobile = window.matchMedia('(max-width: 600px)');
  let swiper: Swiper | undefined;
  const sync = () => {
    if (mobile.matches && !swiper) {
      swiper = new Swiper(slider, {
        modules: [A11y, Keyboard],
        slidesPerView: 'auto',
        spaceBetween: 10,
        grabCursor: true,
        keyboard: { enabled: true, onlyInViewport: true },
      });
    } else if (!mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
    }
  };
  mobile.addEventListener('change', sync);
  sync();
});
