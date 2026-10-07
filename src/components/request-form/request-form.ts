export type RequestFormSubmission = {
  form: HTMLFormElement;
  formData: FormData;
  resolve: (message?: string) => void;
  reject: (message?: string) => void;
};

document.querySelectorAll<HTMLFormElement>('[data-request-form]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('[data-request-status]');
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
  const showStatus = (message: string | undefined) => {
    if (!status || !message) return;
    status.textContent = message;
    status.hidden = false;
  };
  const finish = (message: string | undefined) => {
    form.removeAttribute('aria-busy');
    if (submit) submit.disabled = false;
    showStatus(message);
  };

  form.addEventListener('submit', (event) => {
    const detail: RequestFormSubmission = {
      form,
      formData: new FormData(form),
      resolve: (message) => {
        form.reset();
        finish(message ?? form.dataset.successMessage);
      },
      reject: (message) => finish(message ?? form.dataset.unavailableMessage),
    };

    // A CMS adapter cancels this event and finishes the request via resolve/reject.
    form.setAttribute('aria-busy', 'true');
    if (submit) submit.disabled = true;
    if (status) status.hidden = true;
    const nativeSubmit = form.dispatchEvent(new CustomEvent<RequestFormSubmission>('request-form:submit', {
      bubbles: true,
      cancelable: true,
      detail,
    }));

    if (!nativeSubmit) {
      event.preventDefault();
    } else if (!form.hasAttribute('action')) {
      event.preventDefault();
      detail.reject();
    } else {
      // Keep a native POST available without requiring a JavaScript CMS adapter.
      form.removeAttribute('aria-busy');
      if (submit) submit.disabled = false;
    }
  });
});
