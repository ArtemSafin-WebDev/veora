export type ValidationField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type FormValidatorOptions = {
  /** Disable automatic submit checks when the CMS calls validate() itself. */
  validateOnSubmit?: boolean;
};

/** Validates fields and displays errors; never sends requests or resets values. */
export class FormValidator {
  private static instances = new WeakMap<HTMLFormElement, FormValidator>();
  private static nextErrorId = 0;
  private readonly originalNoValidate: boolean;
  private readonly serverErrors = new Map<ValidationField, string>();
  private readonly displayedFields = new Set<ValidationField>();
  private readonly validateOnSubmit: boolean;
  private hasSubmitted = false;

  static getInstance(form: HTMLFormElement): FormValidator | undefined {
    return this.instances.get(form);
  }

  constructor(public readonly form: HTMLFormElement, options: FormValidatorOptions = {}) {
    if (FormValidator.instances.has(form)) {
      throw new Error('This form already has a FormValidator. Use FormValidator.getInstance(form).');
    }

    this.originalNoValidate = form.noValidate;
    this.validateOnSubmit = options.validateOnSubmit ?? true;
    // Set only after JS initializes, preserving native validation without JS.
    form.noValidate = true;
    FormValidator.instances.set(form, this);
    if (this.validateOnSubmit) form.addEventListener('submit', this.onSubmit, true);
    form.addEventListener('focusout', this.onBlur);
    form.addEventListener('input', this.onInput);
    form.addEventListener('change', this.onInput);
    form.addEventListener('reset', this.onReset);
  }

  /** Returns false on errors. Focuses the first invalid field unless disabled. */
  validate({ focus = true }: { focus?: boolean } = {}): boolean {
    this.hasSubmitted = true;
    let firstInvalid: ValidationField | undefined;
    for (const field of this.fields) {
      if (!this.validateField(field) && !firstInvalid) firstInvalid = field;
    }
    if (focus) firstInvalid?.focus();
    return !firstInvalid;
  }

  validateField(field: ValidationField): boolean {
    if (field.form !== this.form) return true;
    const message = field.willValidate ? this.serverErrors.get(field) || this.getMessage(field) : '';
    this.showError(field, message);
    return !message;
  }

  /** Bitrix errors keyed by the input's actual name, e.g. { 'EMAIL': '…' }. */
  setErrors(errors: Record<string, string>): void {
    this.reset();
    this.hasSubmitted = true;
    for (const field of this.fields) {
      if (!field.willValidate || !Object.hasOwn(errors, field.name) || !errors[field.name]) continue;
      this.serverErrors.set(field, errors[field.name]);
      this.showError(field, errors[field.name]);
    }
  }

  /** Clears validation errors only. Use form.reset() to reset field values. */
  reset(): void {
    this.hasSubmitted = false;
    this.serverErrors.clear();
    for (const field of [...this.displayedFields]) this.showError(field, '');
  }

  destroy(): void {
    this.reset();
    this.form.noValidate = this.originalNoValidate;
    this.form.removeEventListener('submit', this.onSubmit, true);
    this.form.removeEventListener('focusout', this.onBlur);
    this.form.removeEventListener('input', this.onInput);
    this.form.removeEventListener('change', this.onInput);
    this.form.removeEventListener('reset', this.onReset);
    FormValidator.instances.delete(this.form);
  }

  private get fields(): ValidationField[] {
    return Array.from(this.form.elements).filter((element): element is ValidationField => this.isField(element));
  }

  private isField(element: EventTarget | null): element is ValidationField {
    return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;
  }

  private getMessage(field: ValidationField): string {
    const { validity, dataset } = field;
    const message = (rule: string) => dataset[`validation${rule}`] || this.form.dataset[`validation${rule}`] || field.validationMessage || this.form.dataset.validationInvalid || 'Invalid value';
    const textField = field instanceof HTMLTextAreaElement || (field instanceof HTMLInputElement && ['text', 'search', 'tel', 'url', 'email', 'password'].includes(field.type));

    if (validity.customError) return field.validationMessage;
    if (field instanceof HTMLInputElement && field.dataset.mask) {
      const digits = field.value.replace(/\D/g, '');
      const empty = field.dataset.mask === 'phone' ? !digits.replace(/^7/, '') : !digits;
      if (empty) return field.required ? message('Required') : '';
    }
    if (validity.valueMissing || (textField && field.required && !field.value.trim())) return message('Required');
    if (validity.typeMismatch) return message(field instanceof HTMLInputElement && field.type === 'email' ? 'Email' : 'Invalid');
    if (validity.patternMismatch) return message('Pattern');
    if (field instanceof HTMLInputElement && field.dataset.mask === 'date' && field.value) {
      const [day, month, year] = field.value.split('.').map(Number);
      const date = new Date(0);
      date.setUTCFullYear(year, month - 1, day);
      if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return message('Invalid');
    }
    // Native length checks do not cover values assigned programmatically by a CMS.
    if (textField && field.value && field.minLength > 0 && field.value.length < field.minLength) return message('TooShort');
    if (textField && field.maxLength >= 0 && field.value.length > field.maxLength) return message('TooLong');
    if (!validity.valid) return message('Invalid');
    return '';
  }

  private showError(field: ValidationField, message: string): void {
    const error = Array.from(this.form.querySelectorAll<HTMLElement>('[data-validation-error-for]')).find((element) => element.dataset.validationErrorFor === field.name);
    const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));

    if (error) {
      if (!error.id) error.id = `form-validation-error-${++FormValidator.nextErrorId}`;
      error.textContent = message;
      error.hidden = !message;
      if (message) descriptions.add(error.id);
      else descriptions.delete(error.id);
      if (descriptions.size) field.setAttribute('aria-describedby', [...descriptions].join(' '));
      else field.removeAttribute('aria-describedby');
    }

    if (message) {
      field.setAttribute('aria-invalid', 'true');
      this.displayedFields.add(field);
    } else {
      field.removeAttribute('aria-invalid');
      this.displayedFields.delete(field);
    }
  }

  private onSubmit = (event: SubmitEvent): void => {
    if (event.submitter instanceof HTMLButtonElement || event.submitter instanceof HTMLInputElement) {
      if (event.submitter.formNoValidate) return;
    }
    if (this.validate()) return;
    event.preventDefault();
    // Prevent the CMS's regular submit handler from sending an invalid form.
    event.stopImmediatePropagation();
  };

  private onBlur = (event: FocusEvent): void => {
    if (!this.hasSubmitted || !this.isField(event.target)) return;
    // Check these controls on change, after the browser updates their value.
    if (event.target instanceof HTMLInputElement && ['checkbox', 'radio'].includes(event.target.type)) return;
    this.validateField(event.target);
  };

  private onInput = (event: Event): void => {
    if (!this.hasSubmitted || !this.isField(event.target)) return;
    // Clear the server error for the edited field (including a radio group).
    for (const field of this.fields) {
      if (field !== event.target && (!field.name || field.name !== event.target.name)) continue;
      this.serverErrors.delete(field);
      this.validateField(field);
    }
  };

  private onReset = (): void => this.reset();
}
