import IMask from 'imask';

/** Initialize only explicitly configured fields; keep their original empty placeholders. */
export function initInputMasks(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLInputElement>('input[data-mask]').forEach((input) => {
    const patterns: Record<string, string> = {
      phone: '+{7} (000) 000-00-00',
      time: '00:00',
      date: '00.00.0000',
    };
    const pattern = patterns[input.dataset.mask ?? ''];
    if (!pattern) return;

    const mask = IMask(input, {
      mask: pattern,
      lazy: true,
      // Normalize a pasted Russian domestic number before the mask consumes it.
      prepare: (value) => {
        const digits = value.replace(/\D/g, '');
        return input.dataset.mask === 'phone' && /^8\d{10}$/.test(digits)
          ? `7${digits.slice(1)}`
          : value;
      },
    });

    const positionEmptyCursor = () => {
      const digits = mask.unmaskedValue.replace(/\D/g, '');
      const empty = input.dataset.mask === 'phone' ? !digits.replace(/^7/, '') : !digits;
      if (!empty) return;
      const position = input.value.indexOf('_');
      if (position >= 0) input.setSelectionRange(position, position);
    };
    const showMask = () => {
      mask.updateOptions({ lazy: false });
      positionEmptyCursor();
    };
    input.addEventListener('focus', showMask);
    input.addEventListener('click', showMask);
    input.addEventListener('blur', () => mask.updateOptions({ lazy: true }));

    // Remove unfilled template characters before validation and serialization,
    // including when Enter submits directly from a focused masked field.
    form.addEventListener('submit', () => mask.updateOptions({ lazy: true }), true);

    // Native form.reset() changes values after its reset event has completed.
    form.addEventListener('reset', () => queueMicrotask(() => {
      mask.updateValue();
      mask.updateOptions({ lazy: document.activeElement !== input });
    }));
  });
}
