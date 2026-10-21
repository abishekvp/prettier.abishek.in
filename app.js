/**
 * Prettier Code Studio — Application Logic
 * Supports Multi-Language Formatting, Diff Viewer & Minifier
 */

// ================= THEME & SUITE SWITCHER =================
const themeToggle = document.getElementById('themeToggle');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const switcherBtn = document.getElementById('switcherBtn');
const switcherMenu = document.getElementById('switcherMenu');

const savedTheme = localStorage.getItem('prettier_theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.remove('dark-theme');
  document.body.classList.add('light-theme');
}

themeToggle?.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('prettier_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('prettier_theme', 'dark');
  }
});

fullscreenToggle?.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
    document.body.classList.add('fullscreen-mode');
  } else {
    document.exitFullscreen().catch(() => {});
    document.body.classList.remove('fullscreen-mode');
  }
});

switcherBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  switcherMenu?.classList.toggle('show');
});

document.addEventListener('click', () => {
  switcherMenu?.classList.remove('show');
});

// ================= VIEW TOGGLE (EDITOR VS DIFF) =================
const viewButtons = document.querySelectorAll('.view-btn');
const paneEditor = document.getElementById('paneEditor');
const paneDiff = document.getElementById('paneDiff');
const btnToggleSettings = document.getElementById('btnToggleSettings');
const optionsDrawer = document.getElementById('optionsDrawer');

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    viewButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const view = btn.dataset.view;
    if (view === 'editor') {
      paneEditor.style.display = 'flex';
      paneDiff.style.display = 'none';
    } else {
      paneEditor.style.display = 'none';
      paneDiff.style.display = 'flex';
      renderDiff();
    }
  });
});

btnToggleSettings?.addEventListener('click', () => {
  optionsDrawer.classList.toggle('show');
});

// ================= DOM ELEMENTS & EDITORS =================
const languageSelect = document.getElementById('languageSelect');
const rawCodeInput = document.getElementById('rawCodeInput');
const formattedCodeOutput = document.getElementById('formattedCodeOutput');
const inputLines = document.getElementById('inputLines');
const outputLines = document.getElementById('outputLines');
const inputMeta = document.getElementById('inputMeta');
const outputMeta = document.getElementById('outputMeta');
const formatErrorBanner = document.getElementById('formatErrorBanner');
const statusLang = document.getElementById('statusLang');
const statusTime = document.getElementById('statusTime');
const statusRules = document.getElementById('statusRules');

const btnFormatCode = document.getElementById('btnFormatCode');
const btnMinifyCode = document.getElementById('btnMinifyCode');
const btnLoadSample = document.getElementById('btnLoadSample');
const btnClearCode = document.getElementById('btnClearCode');
const btnPasteCode = document.getElementById('btnPasteCode');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnDownloadCode = document.getElementById('btnDownloadCode');
const codeFileInput = document.getElementById('codeFileInput');

// Option Selects
const optTabWidth = document.getElementById('optTabWidth');
const optUseTabs = document.getElementById('optUseTabs');
const optSemi = document.getElementById('optSemi');
const optSingleQuote = document.getElementById('optSingleQuote');
const optTrailingComma = document.getElementById('optTrailingComma');
const optPrintWidth = document.getElementById('optPrintWidth');
const optBracketSpacing = document.getElementById('optBracketSpacing');
const optArrowParens = document.getElementById('optArrowParens');

function bytesToSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function updateLineNumbers(textarea, lineContainer) {
  const lineCount = (textarea.value || '').split('\n').length;
  let html = '';
  for (let i = 1; i <= lineCount; i++) {
    html += `<div>${i}</div>`;
  }
  lineContainer.innerHTML = html;
}

rawCodeInput?.addEventListener('scroll', () => {
  inputLines.scrollTop = rawCodeInput.scrollTop;
});

formattedCodeOutput?.addEventListener('scroll', () => {
  outputLines.scrollTop = formattedCodeOutput.scrollTop;
});

rawCodeInput?.addEventListener('input', () => {
  updateLineNumbers(rawCodeInput, inputLines);
  const lines = rawCodeInput.value.split('\n').length;
  const bytes = new TextEncoder().encode(rawCodeInput.value).length;
  inputMeta.textContent = `${lines} lines · ${bytesToSize(bytes)}`;
  localStorage.setItem('prettier_raw_code', rawCodeInput.value);
});

// Update Status Bar Rules
function updateStatusRules() {
  const rules = `${optTabWidth.value} spaces · ${optSemi.value === 'true' ? 'semi' : 'no-semi'} · ${optSingleQuote.value === 'true' ? 'single-quote' : 'double-quote'}`;
  statusRules.textContent = rules;
  statusLang.textContent = languageSelect.options[languageSelect.selectedIndex].text;
}

[optTabWidth, optUseTabs, optSemi, optSingleQuote, optTrailingComma, optPrintWidth, optBracketSpacing, optArrowParens].forEach(el => {
  el.addEventListener('change', () => {
    updateStatusRules();
    formatCode();
  });
});

languageSelect.addEventListener('change', () => {
  updateStatusRules();
  localStorage.setItem('prettier_lang', languageSelect.value);
  if (rawCodeInput.value.trim()) {
    formatCode();
  }
});

// ================= BUILT-IN FALLBACK BEAUTIFIERS =================
function formatSql(sql) {
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];
  let formatted = sql.replace(/\s+/g, ' ').trim();
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${kw}`);
  });
  return formatted.trim();
}

function formatPython(code) {
  // Cleans empty lines and trims trailing spaces
  return code.split('\n')
    .map(l => l.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function formatXml(xml) {
  let formatted = '', indent = '';
  const tab = '  ';
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
    formatted += indent + '<' + node + '>\r\n';
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
  });
  return formatted.substring(1, formatted.length - 3);
}

// ================= PRETTIER FORMATTING ENGINE =================
async function formatCode() {
  const raw = rawCodeInput.value;
  formatErrorBanner.classList.remove('show');

  if (!raw.trim()) {
    formattedCodeOutput.value = '';
    outputMeta.textContent = '0 lines · 0 B';
    updateLineNumbers(formattedCodeOutput, outputLines);
    return;
  }

  const lang = languageSelect.value;
  const startTime = performance.now();

  try {
    let result = '';

    // Handle custom non-Prettier parsers first
    if (lang === 'sql') {
      result = formatSql(raw);
    } else if (lang === 'python') {
      result = formatPython(raw);
    } else if (lang === 'xml') {
      result = formatXml(raw);
    } else {
      // Use Prettier Standalone
      if (typeof prettier === 'undefined') {
        throw new Error('Prettier engine is still initializing or network unreachable.');
      }

      let parser = 'babel';
      let plugins = [];

      if (lang === 'javascript') {
        parser = 'babel';
        plugins = [window.prettierPlugins.babel, window.prettierPlugins.estree];
      } else if (lang === 'typescript') {
        parser = 'babel-ts';
        plugins = [window.prettierPlugins.babel, window.prettierPlugins.estree];
      } else if (lang === 'html') {
        parser = 'html';
        plugins = [window.prettierPlugins.html];
      } else if (lang === 'css') {
        parser = 'css';
        plugins = [window.prettierPlugins.postcss];
      } else if (lang === 'scss') {
        parser = 'scss';
        plugins = [window.prettierPlugins.postcss];
      } else if (lang === 'json') {
        parser = 'json';
        plugins = [window.prettierPlugins.babel, window.prettierPlugins.estree];
      } else if (lang === 'markdown') {
        parser = 'markdown';
        plugins = [window.prettierPlugins.markdown];
      } else if (lang === 'yaml') {
        parser = 'yaml';
        plugins = [window.prettierPlugins.yaml];
      } else if (lang === 'graphql') {
        parser = 'graphql';
        plugins = [window.prettierPlugins.graphql];
      }

      result = await prettier.format(raw, {
        parser: parser,
        plugins: plugins,
        tabWidth: parseInt(optTabWidth.value, 10),
        useTabs: optUseTabs.value === 'true',
        semi: optSemi.value === 'true',
        singleQuote: optSingleQuote.value === 'true',
        trailingComma: optTrailingComma.value,
        printWidth: parseInt(optPrintWidth.value, 10),
        bracketSpacing: optBracketSpacing.value === 'true',
        arrowParens: optArrowParens.value
      });
    }

    const elapsed = Math.round(performance.now() - startTime);
    statusTime.textContent = `${elapsed} ms`;

    formattedCodeOutput.value = result;
    updateLineNumbers(formattedCodeOutput, outputLines);

    const outLines = result.split('\n').length;
    const outBytes = new TextEncoder().encode(result).length;
    outputMeta.textContent = `${outLines} lines · ${bytesToSize(outBytes)}`;

    if (paneDiff.style.display !== 'none') {
      renderDiff();
    }

  } catch (err) {
    formatErrorBanner.textContent = `Formatting Error: ${err.message}`;
    formatErrorBanner.classList.add('show');
  }
}

// Minify Handler
btnMinifyCode?.addEventListener('click', () => {
  const raw = rawCodeInput.value;
  if (!raw.trim()) return;

  const lang = languageSelect.value;
  let minified = '';

  if (lang === 'json') {
    try {
      minified = JSON.stringify(JSON.parse(raw));
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
      return;
    }
  } else if (lang === 'css' || lang === 'scss') {
    minified = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([:;{}])\s*/g, '$1').trim();
  } else if (lang === 'html' || lang === 'xml') {
    minified = raw.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  } else {
    // Basic single-line compact
    minified = raw.replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ').trim();
  }

  formattedCodeOutput.value = minified;
  updateLineNumbers(formattedCodeOutput, outputLines);
  const outLines = minified.split('\n').length;
  const outBytes = new TextEncoder().encode(minified).length;
  outputMeta.textContent = `${outLines} lines · ${bytesToSize(outBytes)}`;
});

// ================= DIFF COMPARISON VIEW =================
const diffBody = document.getElementById('diffBody');

function renderDiff() {
  const original = rawCodeInput.value.split('\n');
  const formatted = formattedCodeOutput.value.split('\n');

  if (!rawCodeInput.value.trim() || !formattedCodeOutput.value.trim()) {
    diffBody.innerHTML = '<div class="diff-empty">Please format code first to view differences.</div>';
    return;
  }

  diffBody.innerHTML = '';
  const maxLines = Math.max(original.length, formatted.length);

  for (let i = 0; i < maxLines; i++) {
    const origLine = original[i];
    const formLine = formatted[i];

    if (origLine === formLine) {
      const row = document.createElement('div');
      row.className = 'diff-row diff-row-unchanged';
      row.textContent = `  ${origLine ?? ''}`;
      diffBody.appendChild(row);
    } else {
      if (origLine !== undefined) {
        const rowRem = document.createElement('div');
        rowRem.className = 'diff-row diff-row-removed';
        rowRem.textContent = `- ${origLine}`;
        diffBody.appendChild(rowRem);
      }
      if (formLine !== undefined) {
        const rowAdd = document.createElement('div');
        rowAdd.className = 'diff-row diff-row-added';
        rowAdd.textContent = `+ ${formLine}`;
        diffBody.appendChild(rowAdd);
      }
    }
  }
}

// ================= SAMPLES FOR ALL LANGUAGES =================
const SAMPLES = {
  javascript: `// Unformatted JavaScript
function calculateMetrics(items,discountRate=0.15){
const total=items.reduce((acc,curr)=>{return acc+curr.price*curr.qty},0)
if(total>1000){console.log("High value customer order:",total);return total*(1-discountRate);}
return total;}
const sampleOrder=[{id:1,name:"Keyboard",price:149,qty:2},{id:2,name:"Mouse",price:79,qty:1}];
console.log(calculateMetrics(sampleOrder));`,

  typescript: `// Unformatted TypeScript
interface UserRecord<T>{id:string;name:string;meta:T;active?:boolean;}
type OrderStatus='pending'|'processing'|'completed';
class PaymentManager<T>{private apiKey:string;constructor(key:string){this.apiKey=key;}
async process(order:UserRecord<T>):Promise<boolean>{console.log("Processing order for:",order.name);return true;}}`,

  html: `<!-- Unformatted HTML -->
<div class="container"><header class="site-header"><h1>Abishek Cloud Tools</h1>
<nav><ul><li><a href="/">Home</a></li><li><a href="/apps">Apps</a></li>
</ul></nav></header><main><p>High performance developer suite.</p></main></div>`,

  css: `/* Unformatted CSS */
.card-container{display:flex;align-items:center;justify-content:center;padding:24px;background:#0f172a;}
.card{width:360px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);box-shadow:0 10px 25px rgba(0,0,0,0.5);}
.btn-primary:hover{background:#2563eb;transform:translateY(-2px);}`,

  scss: `$primary-color:#3b82f6;$radius:8px;
.button-group{display:flex;gap:12px;.button{background:$primary-color;border-radius:$radius;&:hover{opacity:0.9;}}}`,

  json: `{"name":"Prettier Studio","version":"1.0.0","settings":{"autoFormat":true,"tabSize":2,"semi":true},"plugins":["babel","html","postcss"],"active":true}`,

  markdown: `# Markdown Document
An example unformatted document with **bold text** and [links](https://abishek.in).
- item one
- item two
\`\`\`js
console.log("embedded code");
\`\`\``,

  yaml: `server:
  port: 8080
  host: 0.0.0.0
database:
  name: postgres_db
  pool_size: 10
routes:
  - path: /api/v1/tools
    method: GET`,

  sql: `SELECT u.id, u.username, u.email, COUNT(o.id) as total_orders, SUM(o.amount) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2026-01-01' GROUP BY u.id, u.username HAVING total_spent > 500 ORDER BY total_spent DESC LIMIT 25;`,

  python: `def compute_fibonacci(n: int) -> list[int]:
    if n <= 0: return []
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq

print("Fibonacci Sequence:", compute_fibonacci(10))`,

  graphql: `query GetUserDetails($userId: ID!) {
  user(id: $userId) {
    id
    name
    email
    profile {
      avatarUrl
      bio
    }
    tools(limit: 10) {
      id
      title
    }
  }
}`,

  xml: `<response><status>200</status><payload><item id="1"><name>Tool A</name></item><item id="2"><name>Tool B</name></item></payload></response>`
};

function loadSampleForCurrentLanguage() {
  const lang = languageSelect.value;
  if (SAMPLES[lang]) {
    rawCodeInput.value = SAMPLES[lang];
    updateLineNumbers(rawCodeInput, inputLines);
    const lines = rawCodeInput.value.split('\n').length;
    const bytes = new TextEncoder().encode(rawCodeInput.value).length;
    inputMeta.textContent = `${lines} lines · ${bytesToSize(bytes)}`;
    formatCode();
  }
}

btnLoadSample?.addEventListener('click', loadSampleForCurrentLanguage);

// File drag & drop or upload
codeFileInput?.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Auto detect language from extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const extMap = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    html: 'html', htm: 'html', css: 'css', scss: 'scss', json: 'json',
    md: 'markdown', yaml: 'yaml', yml: 'yaml', sql: 'sql', py: 'python',
    graphql: 'graphql', xml: 'xml'
  };

  if (extMap[ext]) {
    languageSelect.value = extMap[ext];
    updateStatusRules();
  }

  const reader = new FileReader();
  reader.onload = (evt) => {
    rawCodeInput.value = evt.target.result;
    updateLineNumbers(rawCodeInput, inputLines);
    formatCode();
  };
  reader.readAsText(file);
});

// Drag and drop onto textarea
rawCodeInput?.addEventListener('dragover', (e) => e.preventDefault());
rawCodeInput?.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const extMap = {
      js: 'javascript', ts: 'typescript', html: 'html', css: 'css',
      scss: 'scss', json: 'json', md: 'markdown', yaml: 'yaml', sql: 'sql', py: 'python'
    };
    if (extMap[ext]) {
      languageSelect.value = extMap[ext];
      updateStatusRules();
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      rawCodeInput.value = evt.target.result;
      updateLineNumbers(rawCodeInput, inputLines);
      formatCode();
    };
    reader.readAsText(file);
  }
});

btnClearCode?.addEventListener('click', () => {
  rawCodeInput.value = '';
  formattedCodeOutput.value = '';
  updateLineNumbers(rawCodeInput, inputLines);
  updateLineNumbers(formattedCodeOutput, outputLines);
  inputMeta.textContent = '0 lines · 0 B';
  outputMeta.textContent = '0 lines · 0 B';
  localStorage.removeItem('prettier_raw_code');
  diffContainer.innerHTML = '';
  formatErrorBanner.style.display = 'none';
});

btnPasteCode?.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    rawCodeInput.value = text;
    localStorage.setItem('prettier_raw_code', text);
    updateLineNumbers(rawCodeInput, inputLines);
    formatCode();
  } catch (err) {
    alert('Please press Ctrl+V to paste.');
  }
});

btnCopyCode?.addEventListener('click', async () => {
  if (!formattedCodeOutput.value) return;
  await navigator.clipboard.writeText(formattedCodeOutput.value);
  btnCopyCode.textContent = '✓ Copied!';
  setTimeout(() => btnCopyCode.textContent = 'Copy Output', 1500);
});

btnDownloadCode?.addEventListener('click', () => {
  if (!formattedCodeOutput.value) return;
  const extMap = {
    javascript: 'js', typescript: 'ts', html: 'html', css: 'css',
    scss: 'scss', json: 'json', markdown: 'md', yaml: 'yaml', sql: 'sql',
    python: 'py', graphql: 'graphql', xml: 'xml'
  };
  const ext = extMap[languageSelect.value] || 'txt';
  const blob = new Blob([formattedCodeOutput.value], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `formatted-code.${ext}`;
  a.click();
});

btnFormatCode?.addEventListener('click', formatCode);

// Shortcut Ctrl+Enter
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    formatCode();
  }
});

// Column Resizing & Persistence
const prettierResizer = document.getElementById('prettierResizer');
const paneEditorEl = document.getElementById('paneEditor');
const rawCol = paneEditorEl?.children[0];
const formattedCol = paneEditorEl?.children[2];

function applyPrettierColRatio(ratio) {
  if (!rawCol || !formattedCol) return;
  const clamped = Math.max(0.15, Math.min(0.85, ratio));
  rawCol.style.flex = `${clamped} 1 0%`;
  formattedCol.style.flex = `${1 - clamped} 1 0%`;
  localStorage.setItem('prettier_col_ratio', clamped.toFixed(4));
}

if (prettierResizer && paneEditorEl) {
  let isResizing = false;

  prettierResizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    prettierResizer.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isResizing || !paneEditorEl) return;
    const rect = paneEditorEl.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    applyPrettierColRatio(ratio);
  });

  window.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      prettierResizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // Restore saved ratio
  const savedRatio = parseFloat(localStorage.getItem('prettier_col_ratio'));
  if (!isNaN(savedRatio)) {
    applyPrettierColRatio(savedRatio);
  }
}

// Initial Setup
const savedLang = localStorage.getItem('prettier_lang');
if (savedLang && Array.from(languageSelect.options).some(o => o.value === savedLang)) {
  languageSelect.value = savedLang;
}
updateStatusRules();

const savedCode = localStorage.getItem('prettier_raw_code') || '';
if (savedCode) {
  rawCodeInput.value = savedCode;
  updateLineNumbers(rawCodeInput, inputLines);
  const lines = rawCodeInput.value.split('\n').length;
  const bytes = new TextEncoder().encode(rawCodeInput.value).length;
  inputMeta.textContent = `${lines} lines · ${bytesToSize(bytes)}`;
  formatCode();
} else {
  rawCodeInput.value = '';
  formattedCodeOutput.value = '';
  updateLineNumbers(rawCodeInput, inputLines);
  updateLineNumbers(formattedCodeOutput, outputLines);
  inputMeta.textContent = '0 lines · 0 B';
  outputMeta.textContent = '0 lines · 0 B';
}
