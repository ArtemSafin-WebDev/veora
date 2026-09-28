/** A radio-based select whose options open above the document flow. */
export class CustomSelect {
  private readonly trigger: HTMLButtonElement;
  private readonly popover: HTMLElement;
  private readonly value: HTMLElement;
  private readonly radios: HTMLInputElement[];
  private readonly keepOpen: boolean;

  constructor(private readonly root: HTMLElement) {
    const trigger = root.querySelector<HTMLButtonElement>('[data-select-trigger]');
    const popover = root.querySelector<HTMLElement>('[data-select-popover]');
    const value = root.querySelector<HTMLElement>('[data-select-value]');
    if (!trigger || !popover || !value) throw new Error('CustomSelect requires a trigger, popover and value');

    this.trigger = trigger;
    this.popover = popover;
    this.value = value;
    this.radios = Array.from(root.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    this.keepOpen = root.dataset.selectKeepOpen === 'true';
    this.updateValue();

    trigger.addEventListener('click', () => this.toggle());
    popover.addEventListener('toggle', () => {
      trigger.setAttribute('aria-expanded', String(this.isOpen()));
      if (this.isOpen()) this.positionPopover();
    });

    this.radios.forEach((radio) => {
      radio.addEventListener('change', () => {
        this.updateValue();
        if (!this.keepOpen) this.close();
      });
    });

    document.addEventListener('pointerdown', (event) => {
      if (this.isOpen() && event.target instanceof Node && !root.contains(event.target)) this.close();
    });
    document.addEventListener('keydown', (event) => {
      if (this.isOpen() && event.key === 'Escape') {
        this.close();
        this.trigger.focus();
      }
    });
    document.addEventListener('scroll', () => { if (this.isOpen()) this.positionPopover(); }, true);
    window.addEventListener('resize', () => { if (this.isOpen()) this.positionPopover(); });
  }

  private isOpen(): boolean {
    return this.popover.matches(':popover-open');
  }

  private toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }

    document.querySelectorAll<HTMLElement>('[data-select-popover]:popover-open').forEach((popover) => popover.hidePopover());
    this.popover.showPopover();
    this.positionPopover();
    this.radios.find((radio) => radio.checked)?.focus();
  }

  private close(): void {
    if (this.isOpen()) this.popover.hidePopover();
  }

  private updateValue(): void {
    const labels = this.radios.filter((radio) => radio.checked).map((radio) => radio.dataset.selectLabel ?? '').filter(Boolean);
    this.value.textContent = labels.join(', ');
  }

  private positionPopover(): void {
    const rect = this.trigger.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 220), window.innerWidth - 24);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
    const height = this.popover.getBoundingClientRect().height;
    const below = rect.bottom + 8;
    const top = below + height <= window.innerHeight - 12 || rect.top < height + 20
      ? Math.max(12, Math.min(below, window.innerHeight - height - 12))
      : rect.top - height - 8;

    this.popover.style.width = `${width / 10}rem`;
    this.popover.style.left = `${left / 10}rem`;
    this.popover.style.top = `${top / 10}rem`;
  }
}

document.querySelectorAll<HTMLElement>('[data-custom-select]').forEach((root) => new CustomSelect(root));
