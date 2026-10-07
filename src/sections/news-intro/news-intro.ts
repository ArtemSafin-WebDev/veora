document.querySelectorAll<HTMLElement>('[data-news-intro]').forEach((intro) => {
  const status = intro.querySelector<HTMLElement>('[data-news-status]');
  const announce = (message: string | undefined) => {
    if (!status || !message) return;
    status.textContent = message;
    status.hidden = false;
  };

  intro.querySelector('[data-news-print]')?.addEventListener('click', () => window.print());
  intro.querySelector('[data-news-share]')?.addEventListener('click', async () => {
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
