document.querySelectorAll<HTMLElement>('.service-catalog__sidebar').forEach((sidebar) => {
  // A tall sidebar scrolls naturally until its bottom reaches the viewport edge.
  // Observe its height so opening filter groups also updates the sticky offset.
  const syncHeight = () => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    sidebar.style.setProperty('--service-catalog-sidebar-height', `${sidebar.getBoundingClientRect().height / rem}rem`);
  };

  syncHeight();
  new ResizeObserver(syncHeight).observe(sidebar);
});
