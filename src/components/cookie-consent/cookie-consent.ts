import { getModal } from '../modal/modal';

const consentKey = 'veora-cookie-consent';
const consentVersion = '1';
const dialog = document.querySelector<HTMLDialogElement>('[data-cookie-consent]');

if (dialog) {
  let accepted = false;
  try {
    accepted = localStorage.getItem(consentKey) === consentVersion;
  } catch {
    // Storage may be unavailable; the visitor can still dismiss the notice.
  }

  const modal = getModal(dialog);

  dialog.querySelector<HTMLButtonElement>('[data-cookie-consent-accept]')?.addEventListener('click', () => {
    try {
      localStorage.setItem(consentKey, consentVersion);
    } catch {
      // Keep the acceptance action usable when browser storage is blocked.
    }
    void modal.close();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === consentKey && event.newValue === consentVersion) void modal.close();
  });

  if (!accepted) modal.open();
}
