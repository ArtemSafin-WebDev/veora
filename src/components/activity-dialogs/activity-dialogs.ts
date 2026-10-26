import { getModal } from '../modal/modal';

document.querySelectorAll<HTMLDialogElement>('.activity-dialogs--request').forEach((dialog) => {
  dialog.addEventListener('modal:open', (event) => {
    const trigger = (event as CustomEvent<{ trigger?: HTMLElement }>).detail?.trigger;
    const field = dialog.querySelector<HTMLInputElement>('[name="activity_title"]');
    if (field) field.value = trigger?.dataset.activityTitle ?? '';
  });
});

// Close the description before opening its request so Escape restores the page.
document.querySelectorAll<HTMLButtonElement>('.activity-dialogs__request').forEach((trigger) => {
  trigger.addEventListener('click', async (event) => {
    event.preventDefault();
    const details = trigger.closest<HTMLDialogElement>('dialog');
    const request = document.getElementById(trigger.dataset.modalOpen ?? '');
    if (!details || !(request instanceof HTMLDialogElement)) return;
    await getModal(details).close();
    // The request must restore focus to a visible catalog control.
    const opener = Array.from(document.querySelectorAll<HTMLElement>('.activity-card__request')).find((item) => item.dataset.activityTitle === trigger.dataset.activityTitle);
    getModal(request).open(opener);
  });
});
