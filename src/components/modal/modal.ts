const controllers = new WeakMap<HTMLDialogElement, Modal>();
const openModals = new Set<HTMLDialogElement>();

function syncScrollLock() {
  [document.documentElement, document.body].forEach((element) => {
    element.classList.toggle('modal-scroll-locked', openModals.size > 0);
  });
}

/** Shared dialog lifecycle. Open via data-modal-open="dialog-id" or getModal(). */
export class Modal {
  private opener?: HTMLElement;
  private revision = 0;
  private closing = false;

  constructor(private dialog: HTMLDialogElement) {
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      void this.close();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('[data-modal-close]')) void this.close();
    });

    // Only a press and release on the background dismisses the dialog, never a swipe.
    let backgroundPress = false;
    dialog.addEventListener('pointerdown', (event) => { backgroundPress = event.target === dialog; });
    dialog.addEventListener('pointerup', (event) => {
      if (backgroundPress && event.target === dialog) void this.close();
      backgroundPress = false;
    });
    dialog.addEventListener('pointercancel', () => { backgroundPress = false; });
    dialog.addEventListener('close', () => {
      // A queued native close event may arrive after this dialog has reopened.
      if (dialog.open) return;
      this.revision++;
      this.closing = false;
      dialog.removeAttribute('data-modal-visible');
      openModals.delete(dialog);
      syncScrollLock();
      if (this.opener?.isConnected) this.opener.focus({ preventScroll: true });
      dialog.dispatchEvent(new CustomEvent('modal:close'));
    });
  }

  open(trigger?: HTMLElement) {
    if (this.dialog.open && !this.closing) return;
    const revision = ++this.revision;
    this.closing = false;
    this.opener = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : undefined);
    openModals.add(this.dialog);
    syncScrollLock();
    if (!this.dialog.open) this.dialog.showModal();
    this.dialog.dispatchEvent(new CustomEvent('modal:open', { detail: { trigger } }));
    // Commit the hidden state before starting the entrance transition.
    void this.dialog.offsetWidth;
    requestAnimationFrame(() => {
      if (revision === this.revision && this.dialog.open) this.dialog.setAttribute('data-modal-visible', '');
    });
  }

  async close() {
    if (!this.dialog.open || this.closing) return;
    const revision = ++this.revision;
    this.closing = true;
    this.dialog.dispatchEvent(new CustomEvent('modal:closing'));
    this.dialog.removeAttribute('data-modal-visible');
    // Keep the native modal and scroll lock until the exit transition finishes.
    await Promise.allSettled(this.dialog.getAnimations().map((animation) => animation.finished));
    if (revision === this.revision && this.dialog.open) this.dialog.close();
  }
}

export function getModal(dialog: HTMLDialogElement): Modal {
  let controller = controllers.get(dialog);
  if (!controller) {
    controller = new Modal(dialog);
    controllers.set(dialog, controller);
  }
  return controller;
}

document.querySelectorAll<HTMLDialogElement>('dialog[data-modal]').forEach(getModal);

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || !(event.target instanceof Element)) return;
  const trigger = event.target.closest<HTMLElement>('[data-modal-open]');
  const dialog = document.getElementById(trigger?.dataset.modalOpen ?? '');
  if (!trigger || !(dialog instanceof HTMLDialogElement)) return;
  event.preventDefault();
  getModal(dialog).open(trigger);
});
