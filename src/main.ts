import '@fontsource-variable/inter/wght.css';
import './styles/main.scss';

const year = document.querySelector<HTMLElement>('[data-current-year]');

if (year) {
  year.textContent = String(new Date().getFullYear());
}
