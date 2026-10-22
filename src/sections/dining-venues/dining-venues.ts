import Swiper from 'swiper';
import { A11y, Keyboard } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-dining-venues]').forEach((section) => {
  const slider = section.querySelector<HTMLElement>('[data-dining-venues-slider]');
  const wrapper = slider?.querySelector<HTMLElement>('.swiper-wrapper');
  if (!slider || !wrapper) return;

  const mobile = window.matchMedia('(max-width: 600px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let swiper: Swiper | undefined;

  const sync = () => {
    if (!mobile.matches && !swiper) {
      const slides = Array.from(wrapper.children);
      // Extra copies keep a three-venue loop continuous with visible neighboring cards.
      const copies = Math.max(2, Math.ceil((window.innerWidth / 710 + 3) / slides.length));
      if (slides.length > 1) {
        for (let copy = 1; copy < copies; copy += 1) {
          slides.forEach((slide) => {
            const clone = slide.cloneNode(true) as HTMLElement;
            clone.dataset.diningClone = '';
            wrapper.append(clone);
          });
        }
      }
      swiper = new Swiper(slider, {
        modules: [A11y, Keyboard],
        slidesPerView: 'auto',
        spaceBetween: 12,
        centeredSlides: true,
        initialSlide: slides.length > 1 ? 1 : 0,
        loop: slides.length > 1,
        slideToClickedSlide: true,
        speed: reducedMotion.matches ? 0 : 450,
        keyboard: { enabled: true, onlyInViewport: true },
        a11y: {
          slideLabelMessage: '{{index}} / {{slidesLength}}',
        },
      });
    } else if (mobile.matches && swiper) {
      swiper.destroy(true, true);
      swiper = undefined;
      wrapper.querySelectorAll('[data-dining-clone]').forEach((slide) => slide.remove());
    }
  };

  sync();
  mobile.addEventListener('change', sync);
  reducedMotion.addEventListener('change', () => {
    if (swiper) swiper.params.speed = reducedMotion.matches ? 0 : 450;
  });
});
