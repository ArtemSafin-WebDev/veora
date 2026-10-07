document.querySelectorAll<HTMLElement>('[data-offer-intro]').forEach((intro) => {
  const status = intro.querySelector<HTMLElement>('[data-offer-status]');
  const announce = (message: string | undefined) => {
    if (!status || !message) return;
    status.textContent = message;
    status.hidden = false;
  };

  intro.querySelector('[data-offer-print]')?.addEventListener('click', () => window.print());
  intro.querySelector('[data-offer-share]')?.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.hash = '';
    try {
      if (navigator.share) {
        await navigator.share({ title: intro.querySelector('h1')?.textContent?.trim(), url: url.href });
      } else {
        await navigator.clipboard.writeText(url.href);
        announce(status?.dataset.copiedMessage);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        announce(status?.dataset.shareError);
      }
    }
  });
});
