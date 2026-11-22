(() => {
  const cards = [...document.querySelectorAll('.capture')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.getElementById('search');
  const overview = document.getElementById('overview');
  const theme = document.getElementById('theme');
  const dialog = document.getElementById('viewer');
  const image = document.getElementById('viewer-image');
  let selected = 'All', current = 0;
  const visible = () => cards.filter(card => !card.hidden);
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    for (const card of cards) card.hidden = (selected !== 'All' && card.dataset.category !== selected) || !`${card.textContent} ${card.querySelector('img').alt}`.toLocaleLowerCase().includes(query);
    const count = visible().length;
    document.getElementById('results').textContent = `${count} design capture${count === 1 ? '' : 's'}${selected !== 'All' ? ` / ${selected}` : ''}`;
    document.getElementById('empty').hidden = count !== 0;
  }
  for (const button of filters) button.addEventListener('click', () => {
    selected = button.dataset.filter;
    for (const other of filters) other.setAttribute('aria-pressed', String(other === button));
    filter();
  });
  search.addEventListener('input', filter);
  function setOverview(enabled) {
    document.body.classList.toggle('overview', enabled);
    overview.setAttribute('aria-pressed', String(enabled));
    // All thumbnails are visible together in the overview and in its screenshot.
    if (enabled) for (const card of cards) card.querySelector('img').loading = 'eager';
  }
  setOverview(new URLSearchParams(location.search).get('overview') === '1');
  overview.addEventListener('click', () => setOverview(!document.body.classList.contains('overview')));
  theme.addEventListener('click', () => {
    const light = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    theme.textContent = light ? 'Dark canvas ☾' : 'Light canvas ☼';
    theme.setAttribute('aria-label', light ? 'Switch to dark canvas' : 'Switch to light canvas');
  });
  function show(index) {
    const list = visible();
    current = (index + list.length) % list.length;
    const card = list[current], thumbnail = card.querySelector('img');
    image.src = thumbnail.getAttribute('src');
    image.alt = thumbnail.alt;
    document.getElementById('viewer-title').textContent = card.querySelector('h2').textContent;
    document.getElementById('viewer-description').textContent = card.querySelector('p').textContent;
    document.getElementById('viewer-position').textContent = `${current + 1} / ${list.length} · ${card.dataset.category}`;
    document.getElementById('original').href = thumbnail.getAttribute('src');
    if (!dialog.open) dialog.showModal();
  }
  for (const card of cards) card.querySelector('a').addEventListener('click', event => {
    // Keep direct image links usable without JS, and preserve open-in-new-tab.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); show(visible().indexOf(card));
  });
  document.getElementById('close-viewer').addEventListener('click', () => dialog.close());
  document.getElementById('previous').addEventListener('click', () => show(current - 1));
  document.getElementById('next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
})();
