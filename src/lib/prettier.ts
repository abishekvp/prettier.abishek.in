import { SupportedLanguage, PrettierOptions, DiffRow } from '@/types';

export function bytesToSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatSql(sql: string, indent = '  '): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'JOIN',
    'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'UNION ALL', 'UNION',
    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE'
  ];

  let formatted = sql.replace(/\s+/g, ' ').trim();
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${kw}`);
  });

  return formatted
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const isMajor = keywords.some((kw) => line.toUpperCase().startsWith(kw));
      return isMajor ? line : `${indent}${line}`;
    })
    .join('\n');
}

export function formatXml(xml: string, indent = '  '): string {
  let formatted = '';
  let pad = 0;
  const sanitized = xml.replace(/(>)(<)(\/*)/g, '$1\r\n$2$3');

  sanitized.split('\r\n').forEach((node) => {
    let indentChange = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indentChange = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indentChange = 1;
    }

    formatted += indent.repeat(pad) + node + '\n';
    pad += indentChange;
  });

  return formatted.trim();
}

export function formatPython(code: string, indent = '    '): string {
  return code
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

export function formatJson(code: string, indent = 2): string {
  const parsed = JSON.parse(code);
  return JSON.stringify(parsed, null, indent);
}

export function formatGenericCode(
  code: string,
  lang: SupportedLanguage,
  options: PrettierOptions
): string {
  const padStr = options.useTabs ? '\t' : ' '.repeat(options.tabWidth);

  if (lang === 'json') {
    return formatJson(code, options.useTabs ? 2 : options.tabWidth);
  }

  if (lang === 'sql') {
    return formatSql(code, padStr);
  }

  if (lang === 'xml' || lang === 'html') {
    return formatXml(code, padStr);
  }

  if (lang === 'python') {
    return formatPython(code, padStr);
  }

  // JS/TS/CSS/SCSS/YAML/Markdown/GraphQL
  // Beautify indentation and semicolon/quotes handling
  let lines = code.split('\n');
  let currentIndent = 0;
  const formattedLines: string[] = [];

  for (let rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      formattedLines.push('');
      continue;
    }

    if (line.startsWith('}') || line.startsWith(']') || line.startsWith(')')) {
      currentIndent = Math.max(0, currentIndent - 1);
    }

    // Quotes
    if (options.singleQuote) {
      // transform double quotes to single if safe
      line = line.replace(/"([^"\\]*)"/g, "'$1'");
    }

    // Semicolons
    if (options.semi) {
      if (
        (lang === 'javascript' || lang === 'typescript') &&
        !line.endsWith(';') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.endsWith(':') &&
        !line.startsWith('//') &&
        !line.startsWith('/*')
      ) {
        line += ';';
      }
    }

    formattedLines.push(padStr.repeat(currentIndent) + line);

    if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(')) {
      currentIndent++;
    }
  }

  return formattedLines.join('\n');
}

export function minifyCode(code: string, lang: SupportedLanguage): string {
  if (lang === 'json') {
    try {
      return JSON.stringify(JSON.parse(code));
    } catch (e) {
      return code.replace(/\s+/g, ' ').trim();
    }
  }

  if (lang === 'css' || lang === 'scss') {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([:;{}])\s*/g, '$1')
      .trim();
  }

  if (lang === 'html' || lang === 'xml') {
    return code.replace(/\s+/g, ' ').replace(/> </g, '><').trim();
  }

  // Generic (JS, TS, SQL, etc.)
  return code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeDiff(originalStr: string, formattedStr: string): DiffRow[] {
  const original = originalStr.split('\n');
  const formatted = formattedStr.split('\n');

  if (!originalStr.trim() || !formattedStr.trim()) {
    return [];
  }

  const rows: DiffRow[] = [];
  const max = Math.max(original.length, formatted.length);

  for (let i = 0; i < max; i++) {
    const o = original[i];
    const f = formatted[i];

    if (o === f) {
      rows.push({ type: 'unchanged', text: o ?? '' });
    } else {
      if (o !== undefined) {
        rows.push({ type: 'removed', text: o });
      }
      if (f !== undefined) {
        rows.push({ type: 'added', text: f });
      }
    }
  }

  return rows;
}

export const SAMPLES: Record<SupportedLanguage, string> = {
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
