import AirDatepicker from 'air-datepicker';
import ru from 'air-datepicker/locale/ru';
import 'air-datepicker/air-datepicker.css';

const parseLocalDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

document.querySelectorAll<HTMLInputElement>('[data-booking-dates]').forEach((input) => {
  const start = input.dataset.startDate;
  const end = input.dataset.endDate;
  const selectedDates = start && end ? [parseLocalDate(start), parseLocalDate(end)] : [];

  const picker = new AirDatepicker(input, {
    classes: 'booking-calendar',
    locale: ru,
    range: true,
    selectedDates,
    startDate: new Date(),
    dateFormat: 'dd.MM.yy',
    multipleDatesSeparator: ' - ',
    position: ({ $datepicker, $target, $pointer }) => {
      const target = $target.closest('.booking-search__dates') ?? $target;
      const rect = target.getBoundingClientRect();
      const gap = 8;
      const padding = 12;
      const calendarWidth = $datepicker.offsetWidth;
      const calendarHeight = $datepicker.offsetHeight;
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      const top = below >= calendarHeight + gap || below >= above
        ? rect.bottom + gap
        : rect.top - calendarHeight - gap;
      const left = Math.min(rect.left, window.innerWidth - calendarWidth - padding);
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

      $datepicker.style.position = 'fixed';
      $datepicker.style.top = `${Math.max(padding, Math.min(top, window.innerHeight - calendarHeight - padding)) / rem}rem`;
      $datepicker.style.left = `${Math.max(padding, left) / rem}rem`;
      $pointer.style.display = 'none';
    },
    autoClose: true,
  });
  picker.setViewDate(new Date());
});
