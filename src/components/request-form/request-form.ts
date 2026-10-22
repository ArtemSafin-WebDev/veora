import { FormValidator } from '../../utils/form-validator';
import { initInputMasks } from '../../utils/input-mask';

declare global {
  interface Window {
    FormValidator: typeof FormValidator;
  }
}

// Public API for the CMS's ordinary JS scripts after the site bundle initializes.
window.FormValidator = FormValidator;

document.querySelectorAll<HTMLFormElement>('.request-form__form').forEach((form) => {
  initInputMasks(form);
  if (!FormValidator.getInstance(form)) new FormValidator(form);
});
