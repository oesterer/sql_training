const documents = new Map([
  ['README.md', 'Overview'],
  ['EXERCISES.md', 'Practice questions'],
  ['ANSWERS.md', 'Answer key'],
]);
const requested = new URLSearchParams(location.search).get('doc') || 'EXERCISES.md';
const article = document.getElementById('document');
const filename = documents.has(requested) ? requested : null;
function notice(text) {
  const node = document.createElement('p');
  node.className = 'document-notice'; node.textContent = text;
  article.prepend(node);
}
if (!filename) {
  article.textContent = 'Unknown document. Choose Overview, Practice questions, or Answer key.';
  article.setAttribute('aria-busy', 'false');
} else {
  document.title = `${documents.get(filename)} · SQL Lab`;
  document.getElementById('github').href = `https://github.com/oesterer/sql_training/blob/HEAD/${filename}`;
  document.getElementById('raw').href = `./${filename}`;
  document.querySelectorAll('.docs-nav > a').forEach((link) => {
    if (new URL(link.href).searchParams.get('doc') === filename) link.setAttribute('aria-current', 'page');
  });
  let markdown;
  try {
    const response = await fetch(`./${filename}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    markdown = await response.text();
    // Fetch first so readable source remains available if a CDN is unavailable.
    const [{ marked }, { default: DOMPurify }] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/marked@15.0.12/+esm'),
      import('https://cdn.jsdelivr.net/npm/dompurify@3.2.7/+esm'),
    ]);
    article.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
    const headings = article.querySelectorAll('h1, h2, h3');
    const seen = new Map();
    for (const heading of headings) {
      const slug = heading.textContent.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-');
      const count = seen.get(slug) || 0; seen.set(slug, count + 1);
      heading.id = count ? `${slug}-${count}` : slug;
      if (heading.tagName === 'H2') {
        const link = document.createElement('a'); link.href = `#${heading.id}`; link.textContent = heading.textContent;
        document.getElementById('toc').append(link);
      }
    }
    // Preserve the rendered reader when Markdown documents link to each other.
    for (const link of article.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), location.href);
      const file = url.pathname.split('/').pop();
      if (url.origin === location.origin && documents.has(file)) {
        link.href = `./docs.html?doc=${encodeURIComponent(file)}${url.hash}`;
      } else if (url.origin !== location.origin) {
        link.target = '_blank'; link.rel = 'noopener noreferrer';
      }
    }
    for (const code of article.querySelectorAll('pre > code.language-sql')) {
      const button = document.createElement('button'); button.className = 'copy-sql'; button.textContent = 'Copy SQL';
      button.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(code.textContent); button.textContent = 'Copied!'; }
        catch { button.textContent = 'Select SQL to copy'; }
        setTimeout(() => { button.textContent = 'Copy SQL'; }, 2000);
      });
      code.parentElement.append(button);
    }
    const diagrams = article.querySelectorAll('pre > code.language-mermaid');
    if (diagrams.length) {
      try {
        const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs');
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
        // Render individually, preserving the source block if a diagram fails.
        for (const [i, code] of [...diagrams].entries()) {
          const { svg } = await mermaid.render(`erd-${i}`, code.textContent);
          const diagram = document.createElement('div'); diagram.className = 'mermaid';
          diagram.innerHTML = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } });
          code.parentElement.replaceWith(diagram);
        }
      } catch { notice('The ER diagram could not be rendered. Its Mermaid source is shown instead.'); }
    }
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  } catch (error) {
    article.replaceChildren();
    notice(markdown ? 'Formatting could not load. Showing the original Markdown; you can also open this document on GitHub.' : `Could not load the document: ${error.message}. Try reloading or viewing it on GitHub.`);
    if (markdown) {
      const source = document.createElement('pre'); source.className = 'document-fallback'; source.textContent = markdown; article.append(source);
    }
  } finally { article.setAttribute('aria-busy', 'false'); }
}
