// The two contact layouts request different transfer details. Only submit and
// validate the field visible in the current layout; preserve values on resize.
document.querySelectorAll<HTMLFormElement>('.contacts-transfer form').forEach((form) => {
  const mobile = window.matchMedia('(max-width: 600px)');
  const syncFields = () => {
    form.querySelectorAll<HTMLElement>('[data-field-viewport]').forEach((field) => {
      const input = field.querySelector<HTMLInputElement>('input');
      if (input) input.disabled = (field.dataset.fieldViewport === 'mobile') !== mobile.matches;
    });
  };
  syncFields();
  mobile.addEventListener('change', syncFields);
});
