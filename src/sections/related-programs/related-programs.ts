import Swiper from 'swiper';
import { A11y, Keyboard, Navigation } from 'swiper/modules';

document.querySelectorAll<HTMLElement>('[data-related-programs]').forEach((section) => {
  const slider = section.querySelector<HTMLElement>('[data-related-programs-slider]');
  const wrapper = slider?.querySelector<HTMLElement>('.swiper-wrapper');
  if (!slider || !wrapper) return;

  const slides = Array.from(wrapper.children) as HTMLElement[];
  if (!slides.length) return;

  const mobile = window.matchMedia('(max-width: 600px)');
  let swiper: Swiper | undefined;
  let layout = '';

  const sync = () => {
    const loop = !mobile.matches && slides.length > 1;
    const visibleSlides = Math.ceil(slider.clientWidth / slides[0].getBoundingClientRect().width);
    // Keep enough cards on both sides of the centered slide, even with a short list.
    const copies = loop ? Math.ceil((visibleSlides * 2 + 1) / slides.length) : 1;
    const nextLayout = `${mobile.matches}-${copies}`;
    if (swiper && layout === nextLayout) return;

    const initialSlide = swiper ? swiper.realIndex % slides.length : 0;
    swiper?.destroy(true, true);
    wrapper.replaceChildren(...slides);
    for (let copy = 1; copy < copies; copy += 1) {
      slides.forEach((slide) => wrapper.append(slide.cloneNode(true)));
    }

    layout = nextLayout;
    swiper = new Swiper(slider, {
      modules: [A11y, Keyboard, Navigation],
      slidesPerView: 'auto',
      centeredSlides: true,
      initialSlide,
      loop,
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
  };

  sync();
  window.addEventListener('resize', sync);
});
