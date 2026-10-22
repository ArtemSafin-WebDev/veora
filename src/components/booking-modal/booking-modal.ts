import '../modal/modal';

document.querySelectorAll<HTMLDialogElement>('.booking-modal').forEach((dialog) => {
  dialog.addEventListener('modal:open', (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    const form = dialog.querySelector<HTMLFormElement>('form');
    const voucher = form?.elements.namedItem('voucher_title');
    const service = form?.elements.namedItem('service_title');
    if (voucher instanceof HTMLInputElement) voucher.value = trigger?.dataset.bookingVoucher ?? '';
    if (service instanceof HTMLInputElement) service.value = trigger?.dataset.bookingService ?? '';
    dialog.scrollTop = 0;
  });
});
