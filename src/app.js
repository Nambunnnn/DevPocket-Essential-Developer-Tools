import { formatJson, minifyJson, validateJson } from './tools/json.js';
import { generateUuids } from './tools/uuid.js';
import { decodeBase64, encodeBase64 } from './tools/base64.js';
import { analyzeText } from './tools/text.js';
import { convertColor, hexToRgb, parseRgb } from './tools/color.js';
import { isoToTimestamp, timestampToIso } from './tools/timestamp.js';
import { copyText } from './utils/clipboard.js';

const tools = [
  { id: 'json', name: 'JSON formatter', description: 'Format, minify, and validate JSON.', category: 'Data', icon: '{ }' },
  { id: 'uuid', name: 'UUID generator', description: 'Create secure UUID v4 identifiers.', category: 'Generator', icon: '◇' },
  { id: 'base64', name: 'Base64 converter', description: 'Encode or decode text and Unicode.', category: 'Encoding', icon: '⇄' },
  { id: 'text', name: 'Text analyzer', description: 'Count words, characters, and reading time.', category: 'Text', icon: 'Tt' },
  { id: 'color', name: 'Color converter', description: 'Convert HEX, RGB, and HSL values.', category: 'Color', icon: '◉' },
  { id: 'timestamp', name: 'Timestamp converter', description: 'Convert Unix timestamps and dates.', category: 'Time', icon: '◷' }
];

const app = document.querySelector('#app');
let currentTool = 'overview';
let generatedUuids = [];

app.innerHTML = `
  <div class="app-shell">
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <a class="brand" href="#" data-action="navigate" data-tool="overview" aria-label="DevPocket home">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
        <span>dev<span class="brand-light">pocket</span></span>
      </a>
      <div class="nav-label">WORKSPACE</div>
      <nav class="primary-nav">
        <button class="nav-item" data-action="navigate" data-tool="overview" aria-current="page"><span class="nav-icon" aria-hidden="true">⌂</span>Overview</button>
      </nav>
      <div class="nav-label nav-tools-label">TOOLS</div>
      <nav class="tool-nav" aria-label="Developer tools"></nav>
      <a class="github-link" href="https://github.com/Nambunnnn/DevPocket-Essential-Developer-Tools" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span>View on GitHub</a>
    </aside>
    <div class="mobile-scrim" data-action="close-menu"></div>
    <main class="main-area">
      <header class="topbar">
        <button class="icon-button mobile-menu" data-action="toggle-menu" aria-label="Open navigation" aria-controls="sidebar" aria-expanded="false"><span></span><span></span><span></span></button>
        <div class="breadcrumbs"><span>Workspace</span><span class="crumb-separator">/</span><strong id="page-title">Overview</strong></div>
      </header>
      <div class="content" id="content"></div>
    </main>
    <div class="toast-region" role="status" aria-live="polite" aria-atomic="true"></div>
  </div>
`;

const content = document.querySelector('#content');
const nav = document.querySelector('.tool-nav');

function renderNavigation(filter = '') {
  const matches = tools.filter((tool) => `${tool.name} ${tool.description}`.toLowerCase().includes(filter.toLowerCase()));
  const overviewButton = document.querySelector('.primary-nav [data-tool="overview"]');
  overviewButton.classList.toggle('active', currentTool === 'overview');
  if (currentTool === 'overview') overviewButton.setAttribute('aria-current', 'page');
  else overviewButton.removeAttribute('aria-current');
  nav.innerHTML = matches.length
    ? matches.map((tool) => `<button class="nav-item ${currentTool === tool.id ? 'active' : ''}" data-action="navigate" data-tool="${tool.id}" ${currentTool === tool.id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${tool.icon}</span>${tool.name}</button>`).join('')
    : '<p class="nav-empty">No tools found</p>';
}

function renderToolCards(filter = '') {
  const matches = tools.filter((tool) => `${tool.name} ${tool.description}`.toLowerCase().includes(filter.toLowerCase()));
  return matches.length
    ? matches.map((tool, index) => `
        <button class="tool-card" data-action="navigate" data-tool="${tool.id}" style="--card-index:${index}">
          <span class="card-top"><span class="tool-icon icon-${tool.id}">${tool.icon}</span><span class="card-arrow" aria-hidden="true">↗</span></span>
          <strong>${tool.name}</strong><span class="card-description">${tool.description}</span>
        </button>`).join('')
    : '<div class="search-empty">No tools match your search.</div>';
}

function overviewTemplate() {
  return `
    <section class="page-heading overview-heading">
      <div><div class="eyebrow"><span class="eyebrow-line"></span>DEVELOPER TOOLBOX</div><h1 tabindex="-1">Tools for your daily workflow.</h1><p class="lead">Small, useful utilities for the work you do every day.</p></div>
    </section>
    <section class="section-block">
      <div class="section-title-row"><h2>All tools</h2><label class="search-wrap"><span aria-hidden="true">⌕</span><input id="tool-search" type="search" placeholder="Search tools..." aria-label="Search tools"><kbd>⌘ K</kbd></label></div>
      <div class="tool-grid">${renderToolCards()}</div>
    </section>
  `;
}

function toolHeading(tool, eyebrow = 'DEVELOPER UTILITY') {
  return `<section class="page-heading tool-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span>${eyebrow}</div><h1 tabindex="-1">${tool.name}</h1><p class="lead">${tool.description}</p></div><button class="back-button" data-action="navigate" data-tool="overview"><span aria-hidden="true">←</span> All tools</button></section>`;
}

const toolTemplates = {
  json: () => `${toolHeading(tools[0])}
    <section class="workspace-card">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>JSON WORKSPACE</div><label class="control-label">INDENT <select id="json-indent"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></label></div>
      <div class="editor-columns">
        <div class="editor-pane"><div class="pane-heading"><span>INPUT</span><span class="pane-hint">Paste or type JSON</span></div><textarea id="json-input" class="code-input" spellcheck="false" aria-label="JSON input" placeholder='{&#10;  "name": "DevPocket",&#10;  "private": true&#10;}'></textarea></div>
        <div class="editor-pane output-pane"><div class="pane-heading"><span>OUTPUT</span><span id="json-status" class="pane-hint" aria-live="polite">Ready</span></div><pre id="json-output" class="code-output" aria-label="JSON output">Your formatted JSON will appear here.</pre></div>
      </div>
      <div class="workspace-actions"><div class="action-group"><button class="button button-primary" data-action="json-format">Format JSON <span>↗</span></button><button class="button button-secondary" data-action="json-minify">Minify</button><button class="button button-secondary" data-action="json-validate">Validate</button></div><div class="action-group"><button class="button button-quiet" data-action="json-copy">Copy output</button><button class="button button-quiet" data-action="json-clear">Clear</button></div></div>
    </section>`,
  uuid: () => `${toolHeading(tools[1])}
    <section class="workspace-card compact-workspace">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>UUID WORKSPACE</div><label class="control-label">QUANTITY <select id="uuid-count"><option value="1">1 UUID</option><option value="5" selected>5 UUIDs</option><option value="10">10 UUIDs</option><option value="25">25 UUIDs</option><option value="100">100 UUIDs</option></select></label></div>
      <div class="uuid-intro"><span class="uuid-symbol" aria-hidden="true">◇</span><div><h2>Secure, unique identifiers.</h2><p>Generated with the browser's cryptographically secure random API.</p></div></div>
      <div id="uuid-list" class="uuid-list"><div class="empty-state"><span class="empty-glyph">↯</span><strong>Ready to generate</strong><span>Choose a quantity and create UUID v4 identifiers.</span></div></div>
      <div class="workspace-actions"><div class="action-group"><button class="button button-primary" data-action="uuid-generate">Generate UUIDs <span>↗</span></button><button class="button button-secondary" data-action="uuid-copy-all" disabled>Copy all</button></div></div>
    </section>`,
  base64: () => `${toolHeading(tools[2])}
    <section class="workspace-card">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>BASE64 WORKSPACE</div><span class="toolbar-note">UTF-8 · Unicode supported</span></div>
      <div class="editor-columns">
        <div class="editor-pane"><div class="pane-heading"><span>INPUT</span><span class="pane-hint">Text or Base64</span></div><textarea id="base64-input" class="code-input" spellcheck="false" aria-label="Text or Base64 input" placeholder="Type or paste your text..."></textarea></div>
        <div class="editor-pane output-pane"><div class="pane-heading"><span>RESULT</span><span id="base64-status" class="pane-hint" aria-live="polite">Ready</span></div><textarea id="base64-output" class="code-input result-input" spellcheck="false" aria-label="Base64 result" placeholder="Your result will appear here..." readonly></textarea></div>
      </div>
      <div class="workspace-actions"><div class="action-group"><button class="button button-primary" data-action="base64-encode">Encode <span>→</span></button><button class="button button-secondary" data-action="base64-decode">Decode</button></div><button class="button button-quiet" data-action="base64-copy">Copy result</button></div>
    </section>`,
  text: () => `${toolHeading(tools[3])}
    <section class="workspace-card">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>TEXT WORKSPACE</div><span id="text-live-label" class="toolbar-note">LIVE ANALYSIS</span></div>
      <div class="text-editor-wrap"><textarea id="text-input" class="text-input" aria-label="Text to analyze" placeholder="Start typing or paste your text here..."></textarea><div class="text-editor-footer"><span>ANALYSIS UPDATES AS YOU TYPE</span><span id="text-length">0 CHARACTERS</span></div></div>
      <div class="stats-grid">
        <div class="stat-card"><span>WORDS</span><strong id="stat-words">0</strong><small>total words</small></div>
        <div class="stat-card"><span>CHARACTERS</span><strong id="stat-characters">0</strong><small>including spaces</small></div>
        <div class="stat-card"><span>NO SPACES</span><strong id="stat-no-spaces">0</strong><small>characters only</small></div>
        <div class="stat-card"><span>LINES</span><strong id="stat-lines">0</strong><small>text lines</small></div>
        <div class="stat-card stat-reading"><span>READING TIME</span><strong id="stat-reading">0 <small>min</small></strong><small>at 200 words / min</small></div>
      </div>
    </section>`,
  color: () => `${toolHeading(tools[4])}
    <section class="workspace-card compact-workspace">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>COLOR WORKSPACE</div><span class="toolbar-note">HEX · RGB · HSL</span></div>
      <div class="color-main">
        <div class="color-input-area"><label class="field-label" for="color-input">COLOR VALUE</label><div class="color-input-row"><span class="color-swatch" id="color-swatch" aria-label="Color preview"></span><input id="color-input" type="text" spellcheck="false" value="#6C8EFF" placeholder="#6C8EFF" autocomplete="off"></div><label class="field-label conversion-label" for="color-mode">CONVERT TO</label><select id="color-mode" class="wide-select"><option value="hex-rgb">HEX to RGB</option><option value="hex-hsl">HEX to HSL</option><option value="rgb-hex">RGB to HEX</option><option value="rgb-hsl">RGB to HSL</option></select><p class="input-hint" id="color-hint">Accepts 3- or 6-digit HEX, with or without #.</p></div>
        <div class="color-results"><div class="result-heading"><span>CONVERSION</span><span id="color-status" aria-live="polite">READY</span></div><div id="color-result" class="color-result">—</div><button class="copy-value" data-action="color-copy" disabled>Copy value <span>⧉</span></button></div>
      </div>
      <div class="workspace-actions"><button class="button button-primary" data-action="color-convert">Convert color <span>↗</span></button></div>
    </section>`,
  timestamp: () => `${toolHeading(tools[5])}
    <section class="workspace-card compact-workspace">
      <div class="workspace-toolbar"><div class="workspace-tab"><span class="tab-dot"></span>TIME WORKSPACE</div>
        <div class="timestamp-controls">
          <label class="control-label" for="timestamp-mode">CONVERT<select id="timestamp-mode"><option value="timestamp-to-date">Timestamp to date</option><option value="date-to-timestamp">Date to timestamp</option></select></label>
          <label class="control-label" for="timestamp-unit">UNIT<select id="timestamp-unit"><option value="seconds">Seconds</option><option value="milliseconds">Milliseconds</option></select></label>
        </div>
      </div>
      <div class="timestamp-grid">
        <div class="timestamp-field"><label class="field-label" id="timestamp-input-label" for="timestamp-input">UNIX TIMESTAMP</label><input id="timestamp-input" type="text" inputmode="numeric" spellcheck="false" placeholder="e.g. 1767225600" aria-label="Unix timestamp"></div>
        <div class="timestamp-result"><div class="result-heading"><span>RESULT</span><span id="timestamp-status" class="pane-hint" aria-live="polite">READY</span></div><pre id="timestamp-output" aria-live="polite">Your converted value will appear here.</pre><button class="copy-value" data-action="timestamp-copy" disabled>Copy result <span aria-hidden="true">⧉</span></button></div>
      </div>
      <div class="workspace-actions"><button class="button button-primary" data-action="timestamp-convert">Convert <span aria-hidden="true">↗</span></button></div>
    </section>`
};

function renderPage(focusHeading = false) {
  const tool = tools.find((entry) => entry.id === currentTool);
  document.querySelector('#page-title').textContent = tool?.name ?? 'Overview';
  renderNavigation(document.querySelector('#tool-search')?.value ?? '');
  content.innerHTML = currentTool === 'overview' ? overviewTemplate() : toolTemplates[currentTool]();
  if (currentTool === 'text') updateTextStats();
  if (currentTool === 'color') updateColorPreview();
  document.querySelector('.sidebar').classList.remove('open');
  document.querySelector('.mobile-scrim').classList.remove('visible');
  const menuButton = document.querySelector('.mobile-menu');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  if (focusHeading) content.querySelector('h1')?.focus();
}

function showToast(message, type = 'success') {
  const region = document.querySelector('.toast-region');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  region.replaceChildren(toast);
  window.setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 2800);
}

function setStatus(elementId, message, type = '') {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.className = `pane-hint ${type}`;
  }
}

function runJson(action) {
  const input = document.querySelector('#json-input').value;
  const output = document.querySelector('#json-output');
  try {
    if (!input.trim()) throw new Error('Add JSON to the input before continuing.');
    if (action === 'validate') {
      output.textContent = 'Validation does not modify the input.';
      const result = validateJson(input);
      setStatus('json-status', result.message, result.valid ? 'status-success' : 'status-error');
      showToast(result.message, result.valid ? 'success' : 'error');
      return;
    }
    const indent = document.querySelector('#json-indent').value;
    output.textContent = action === 'minify' ? minifyJson(input) : formatJson(input, indent === 'tab' ? '\t' : Number(indent));
    setStatus('json-status', action === 'minify' ? 'Minified successfully' : 'Formatted successfully', 'status-success');
  } catch (error) {
    output.textContent = 'Output will appear here when the input is valid.';
    setStatus('json-status', error.message, 'status-error');
    showToast(error.message, 'error');
  }
}

function updateTextStats() {
  const input = document.querySelector('#text-input');
  if (!input) return;
  const stats = analyzeText(input.value);
  document.querySelector('#stat-words').textContent = stats.words.toLocaleString();
  document.querySelector('#stat-characters').textContent = stats.characters.toLocaleString();
  document.querySelector('#stat-no-spaces').textContent = stats.charactersWithoutSpaces.toLocaleString();
  document.querySelector('#stat-lines').textContent = stats.lines.toLocaleString();
  document.querySelector('#stat-reading').innerHTML = `${stats.readingTimeMinutes} <small>min</small>`;
  document.querySelector('#text-length').textContent = `${stats.characters.toLocaleString()} ${stats.characters === 1 ? 'CHARACTER' : 'CHARACTERS'}`;
}

function updateColorPreview() {
  const input = document.querySelector('#color-input');
  const swatch = document.querySelector('#color-swatch');
  if (!input || !swatch) return;
  try {
    const mode = document.querySelector('#color-mode').value;
    const rgb = mode.startsWith('hex-') ? hexToRgb(input.value) : parseRgb(input.value);
    swatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    swatch.classList.remove('invalid');
  } catch {
    swatch.style.removeProperty('background-color');
    swatch.classList.add('invalid');
  }
}

function resetColorResult() {
  const result = document.querySelector('#color-result');
  if (!result) return;
  result.textContent = '—';
  result.dataset.value = '';
  document.querySelector('#color-status').textContent = 'READY';
  document.querySelector('#color-status').className = '';
  document.querySelector('[data-action="color-copy"]').disabled = true;
}

async function copyWithToast(value, label) {
  if (!value) {
    showToast('There is nothing to copy yet.', 'error');
    return;
  }
  try {
    await copyText(value);
    showToast(`${label} copied to clipboard.`);
  } catch (error) {
    showToast(error.message || 'Could not access the clipboard.', 'error');
  }
}

function renderUuidList() {
  const list = document.querySelector('#uuid-list');
  list.replaceChildren();
  generatedUuids.forEach((uuid, index) => {
    const row = document.createElement('div');
    row.className = 'uuid-row';
    const number = document.createElement('span');
    number.className = 'uuid-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const value = document.createElement('code');
    value.textContent = uuid;
    const copy = document.createElement('button');
    copy.className = 'uuid-copy';
    copy.dataset.action = 'uuid-copy-one';
    copy.dataset.uuid = uuid;
    copy.setAttribute('aria-label', `Copy UUID ${index + 1}`);
    copy.textContent = '⧉';
    row.append(number, value, copy);
    list.append(row);
  });
  document.querySelector('[data-action="uuid-copy-all"]').disabled = generatedUuids.length === 0;
}

function handleAction(action, target) {
  if (action === 'navigate') {
    currentTool = target.dataset.tool;
    generatedUuids = [];
    renderPage(true);
    return;
  }
  if (action === 'toggle-menu') {
    const sidebar = document.querySelector('.sidebar');
    const open = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', open);
    document.querySelector('.mobile-scrim').classList.toggle('visible', open);
    target.setAttribute('aria-expanded', String(open));
    target.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    return;
  }
  if (action === 'close-menu') {
    document.querySelector('.sidebar').classList.remove('open');
    document.querySelector('.mobile-scrim').classList.remove('visible');
    document.querySelector('.mobile-menu').setAttribute('aria-expanded', 'false');
    document.querySelector('.mobile-menu').setAttribute('aria-label', 'Open navigation');
    return;
  }
  if (action.startsWith('json-')) {
    if (action === 'json-clear') {
      document.querySelector('#json-input').value = '';
      document.querySelector('#json-output').textContent = 'Your formatted JSON will appear here.';
      setStatus('json-status', 'Ready');
    } else if (action === 'json-copy') {
      const output = document.querySelector('#json-output').textContent;
      if (output === 'Your formatted JSON will appear here.' || output === 'Output will appear here when the input is valid.') {
        showToast('There is no JSON output to copy yet.', 'error');
      } else copyWithToast(output, 'Output');
    }
    else runJson(action.slice(5));
    return;
  }
  if (action === 'uuid-generate') {
    try {
      generatedUuids = generateUuids(Number(document.querySelector('#uuid-count').value));
      renderUuidList();
    } catch (error) {
      showToast(error.message, 'error');
    }
    return;
  }
  if (action === 'uuid-copy-one') {
    copyWithToast(target.dataset.uuid, 'UUID');
    return;
  }
  if (action === 'uuid-copy-all') {
    copyWithToast(generatedUuids.join('\n'), 'UUIDs');
    return;
  }
  if (action.startsWith('base64-')) {
    if (action === 'base64-copy') {
      copyWithToast(document.querySelector('#base64-output').value, 'Result');
      return;
    }
    const input = document.querySelector('#base64-input').value;
    try {
      if (!input) throw new Error('Add text to the input before continuing.');
      document.querySelector('#base64-output').value = action === 'base64-encode' ? encodeBase64(input) : decodeBase64(input);
      setStatus('base64-status', action === 'base64-encode' ? 'Encoded successfully' : 'Decoded successfully', 'status-success');
    } catch (error) {
      document.querySelector('#base64-output').value = '';
      setStatus('base64-status', error.message, 'status-error');
      showToast(error.message, 'error');
    }
    return;
  }
  if (action === 'color-convert') {
    const input = document.querySelector('#color-input').value;
    const conversion = document.querySelector('#color-mode').value;
    try {
      const result = convertColor(input, conversion);
      document.querySelector('#color-result').textContent = result.output;
      document.querySelector('#color-result').dataset.value = result.output;
      document.querySelector('#color-status').textContent = 'VALID';
      document.querySelector('#color-status').className = 'valid-label';
      document.querySelector('[data-action="color-copy"]').disabled = false;
      updateColorPreview();
    } catch (error) {
      document.querySelector('#color-result').textContent = error.message;
      document.querySelector('#color-result').dataset.value = '';
      document.querySelector('#color-status').textContent = 'INVALID';
      document.querySelector('#color-status').className = 'invalid-label';
      document.querySelector('[data-action="color-copy"]').disabled = true;
      updateColorPreview();
      showToast(error.message, 'error');
    }
    return;
  }
  if (action === 'color-copy') copyWithToast(document.querySelector('#color-result').dataset.value, 'Color value');
  if (action === 'timestamp-convert') {
    const input = document.querySelector('#timestamp-input').value;
    const unit = document.querySelector('#timestamp-unit').value;
    const direction = document.querySelector('#timestamp-mode').value;
    try {
      if (!input.trim()) throw new Error('Enter a timestamp or date before converting.');
      const output = direction === 'timestamp-to-date'
        ? timestampToIso(input, unit)
        : isoToTimestamp(input, unit);
      const result = document.querySelector('#timestamp-output');
      result.textContent = output;
      result.dataset.value = output;
      setStatus('timestamp-status', 'Converted', 'status-success');
      document.querySelector('[data-action="timestamp-copy"]').disabled = false;
    } catch (error) {
      resetTimestampResult();
      setStatus('timestamp-status', error.message, 'status-error');
      showToast(error.message, 'error');
    }
    return;
  }
  if (action === 'timestamp-copy') {
    copyWithToast(document.querySelector('#timestamp-output').dataset.value, 'Result');
    return;
  }
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (target) handleAction(target.dataset.action, target);
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'tool-search') {
    renderNavigation(event.target.value);
    const grid = document.querySelector('.tool-grid');
    if (grid) grid.innerHTML = renderToolCards(event.target.value);
  }
  if (event.target.id === 'json-input') {
    document.querySelector('#json-output').textContent = 'Your formatted JSON will appear here.';
    setStatus('json-status', 'Input changed');
  }
  if (event.target.id === 'base64-input') {
    document.querySelector('#base64-output').value = '';
    setStatus('base64-status', 'Input changed');
  }
  if (event.target.id === 'timestamp-input') resetTimestampResult();
  if (event.target.id === 'text-input') updateTextStats();
  if (event.target.id === 'color-input') {
    updateColorPreview();
    resetColorResult();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'timestamp-mode' || event.target.id === 'timestamp-unit') {
    if (event.target.id === 'timestamp-mode') {
      const input = document.querySelector('#timestamp-input');
      const dateMode = event.target.value === 'date-to-timestamp';
      input.type = dateMode ? 'datetime-local' : 'text';
      input.inputMode = dateMode ? 'text' : 'numeric';
      input.setAttribute('aria-label', dateMode ? 'Date and time' : 'Unix timestamp');
      input.placeholder = dateMode ? '' : 'e.g. 1767225600';
      document.querySelector('#timestamp-input-label').textContent = dateMode ? 'DATE AND TIME' : 'UNIX TIMESTAMP';
      input.value = '';
    }
    resetTimestampResult();
  }
  if (event.target.id === 'color-mode') {
    document.querySelector('#color-hint').textContent = event.target.value.startsWith('hex-')
      ? 'Accepts 3- or 6-digit HEX, with or without #.'
      : 'Accepts rgb(12, 34, 56) or 12, 34, 56.';
    updateColorPreview();
    resetColorResult();
  }
});

function resetTimestampResult() {
  const output = document.querySelector('#timestamp-output');
  if (!output) return;
  output.textContent = 'Your converted value will appear here.';
  delete output.dataset.value;
  setStatus('timestamp-status', 'READY');
  document.querySelector('[data-action="timestamp-copy"]').disabled = true;
}

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    currentTool = 'overview';
    renderPage();
    document.querySelector('#tool-search').focus();
  }
  if (event.key === 'Escape') handleAction('close-menu', document.querySelector('.mobile-menu'));
});

renderPage();
