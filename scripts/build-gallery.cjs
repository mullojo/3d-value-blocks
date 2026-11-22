// Commit the generated HTML so the gallery also works directly from file://.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const items = require('../gallery-assets/captures.json');
const escape = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function cards() {
  return items.map((item, i) => `      <article class="capture" data-category="${escape(item.category)}">
        <a class="capture-link" href="gallery-assets/captures/${escape(item.file)}" aria-label="View ${escape(item.title)}">
          <div class="capture-image"><img src="gallery-assets/captures/${escape(item.file)}" alt="${escape(item.description)}" loading="lazy" decoding="async"></div>
          <div class="capture-caption"><span class="capture-number">${String(i + 1).padStart(2, '0')}</span><div><h2>${escape(item.title)}</h2><p>${escape(item.description)}</p></div><span class="capture-category">${escape(item.category)}</span></div>
        </a>
      </article>`).join('\n');
}
if (require.main === module) {
  const file = path.join(root, 'gallery.html');
  const html = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, html.replace(/<!-- CAPTURES:START -->[\s\S]*?<!-- CAPTURES:END -->/, `<!-- CAPTURES:START -->\n${cards()}\n      <!-- CAPTURES:END -->`));
  console.log(`Generated ${items.length} static gallery cards.`);
}
module.exports = { cards };
