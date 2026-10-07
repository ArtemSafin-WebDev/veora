import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/golos-text/wght.css';
import './styles/main.scss';
import './components/site-header/site-header';
import './sections/resorts/resorts';
import './components/custom-select/custom-select';
import './components/booking-search/booking-search';
import './sections/gallery/gallery';
import './components/filters/filters';
import './components/pagination/pagination';
import Swiper from 'swiper';

const newsSlider = document.querySelector<HTMLElement>('[data-news] .news__slider');

if (newsSlider) {
  const mobile = window.matchMedia('(max-width: 600px)');
  let newsSwiper: Swiper | undefined;

  const syncNewsSlider = () => {
    if (mobile.matches && !newsSwiper) {
      newsSwiper = new Swiper(newsSlider, { slidesPerView: 'auto', spaceBetween: 8 });
    } else if (!mobile.matches && newsSwiper) {
      newsSwiper.destroy(true, true);
      newsSwiper = undefined;
    }
  };

  syncNewsSlider();
  mobile.addEventListener('change', syncNewsSlider);
}

const services = document.querySelector<HTMLElement>('[data-services]');

if (services) {
  const tabs = Array.from(services.querySelectorAll<HTMLButtonElement>('[data-services-tab]'));

  const activateTab = (tab: HTMLButtonElement, moveFocus = false) => {
    tabs.forEach((item) => {
      const active = item === tab;
      const panel = document.getElementById(item.getAttribute('aria-controls') ?? '');

      item.classList.toggle('services__tab--active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      if (panel) panel.hidden = !active;
    });

    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex: number;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });
}

const offersSlider = document.querySelector<HTMLElement>('[data-offers-slider]');

if (offersSlider) {
  const mobile = window.matchMedia('(max-width: 600px)');
  let offersSwiper: Swiper | undefined;

  const syncOffersSlider = () => {
    if (mobile.matches && !offersSwiper) {
      offersSwiper = new Swiper(offersSlider, { slidesPerView: 'auto', spaceBetween: 8 });
    } else if (!mobile.matches && offersSwiper) {
      offersSwiper.destroy(true, true);
      offersSwiper = undefined;
    }
  };

  syncOffersSlider();
  mobile.addEventListener('change', syncOffersSlider);
}

const year = document.querySelector<HTMLElement>('[data-current-year]');

if (year) {
  year.textContent = String(new Date().getFullYear());
}
