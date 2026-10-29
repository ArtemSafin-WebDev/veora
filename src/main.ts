import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/golos-text/wght.css';
import './styles/main.scss';
import './components/site-header/site-header';
import './components/room-card/room-card';
import './components/accordion/accordion';
import './sections/resorts/resorts';
import './components/custom-select/custom-select';
import './components/booking-search/booking-search';
import './sections/gallery/gallery';
import './sections/resort-gallery/resort-gallery';
import './components/gallery-modal/gallery-modal';
import './components/filters/filters';
import './sections/service-catalog/service-catalog';
import './components/pagination/pagination';
import './components/resort-navigation/resort-navigation';
import './sections/afisha-catalog/afisha-catalog';
import './sections/offer-intro/offer-intro';
import './components/request-form/request-form';
import './sections/related-offers/related-offers';
import './sections/related-rooms/related-rooms';
import './sections/news-intro/news-intro';
import './sections/related-news/related-news';
import './sections/related-events/related-events';
import './sections/contacts-map/contacts-map';
import './sections/contacts-transfer/contacts-transfer';
import './components/search-form/search-form';
import './sections/dining-menus/dining-menus';
import './sections/dining-venues/dining-venues';
import './sections/dining-extras/dining-extras';
import './components/voucher-card/voucher-card';
import './components/booking-modal/booking-modal';
import './components/activity-dialogs/activity-dialogs';
import './components/event-media/event-media';
import './sections/related-programs/related-programs';
import './components/infinite-gallery/infinite-gallery';
import './sections/club-benefits/club-benefits';
import './sections/club-articles/club-articles';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

const newsSlider = document.querySelector<HTMLElement>('[data-news] .news__slider');

if (newsSlider) {
  const mobile = window.matchMedia('(max-width: 900px)');
  let newsSwiper: Swiper | undefined;

  const syncNewsSlider = () => {
    if (mobile.matches && !newsSwiper) {
      newsSwiper = new Swiper(newsSlider, {
        modules: [Navigation],
        slidesPerView: 'auto',
        spaceBetween: 8,
        navigation: {
          prevEl: newsSlider.closest('[data-news]')?.querySelector<HTMLElement>('[data-slider-prev]'),
          nextEl: newsSlider.closest('[data-news]')?.querySelector<HTMLElement>('[data-slider-next]'),
        },
      });
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

  if (services.classList.contains('services--additional') && !services.classList.contains('services--desktop-tabs')) {
    const mobileServices = window.matchMedia('(max-width: 600px)');
    mobileServices.addEventListener('change', () => {
      if (!mobileServices.matches && tabs[0]) activateTab(tabs[0]);
    });
  }

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
  const mobile = window.matchMedia('(max-width: 900px)');
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
