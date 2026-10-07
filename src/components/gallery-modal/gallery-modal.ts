import Swiper from 'swiper';
import { A11y, EffectFade, Keyboard, Navigation } from 'swiper/modules';
import '../modal/modal';

document.querySelectorAll<HTMLElement>('[data-gallery-modal-slider]').forEach((modalSlider) => {
  const dialog = modalSlider.closest<HTMLDialogElement>('dialog[data-modal]');
  if (!dialog) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let modalSwiper: Swiper | undefined;

  dialog.addEventListener('modal:open', (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail.trigger;
    const index = Number(trigger?.dataset.galleryIndex ?? 0);

    if (!modalSwiper) {
      modalSwiper = new Swiper(modalSlider, {
        modules: [Navigation, Keyboard, A11y, EffectFade],
        effect: 'fade',
        fadeEffect: { crossFade: true },
        initialSlide: index,
        slidesPerView: 1,
        speed: reducedMotion.matches ? 0 : 300,
        rewind: true,
        keyboard: { enabled: true, onlyInViewport: false, pageUpDown: false },
        navigation: {
          prevEl: dialog.querySelector<HTMLElement>('.gallery-modal__arrow--prev'),
          nextEl: dialog.querySelector<HTMLElement>('.gallery-modal__arrow--next'),
        },
        a11y: {
          prevSlideMessage: dialog.querySelector('.gallery-modal__arrow--prev')?.getAttribute('aria-label') ?? '',
          nextSlideMessage: dialog.querySelector('.gallery-modal__arrow--next')?.getAttribute('aria-label') ?? '',
          slideLabelMessage: '{{index}} / {{slidesLength}}',
        },
      });
    } else {
      modalSwiper.update();
      modalSwiper.slideTo(index, 0);
      modalSwiper.keyboard.enable();
    }
  });

  dialog.addEventListener('modal:closing', () => modalSwiper?.keyboard.disable());
  dialog.addEventListener('modal:close', () => modalSwiper?.keyboard.disable());
  reducedMotion.addEventListener('change', () => {
    if (modalSwiper) modalSwiper.params.speed = reducedMotion.matches ? 0 : 300;
  });
});
