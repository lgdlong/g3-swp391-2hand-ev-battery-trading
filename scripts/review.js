// review.js (one-shot): Review toàn bộ PR diff bằng 1 lần gọi API, xuất review.md + issues.json
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fetch } from 'undici';

const CLAUDE_SONNET_4_5 = 'claude-sonnet-4-5-20250929';
const CLAUDE_SONNET_4 = 'claude-sonnet-4-20241022';
const THIRD_PARTY_BASE_URL = 'https://v98store.com';

// Dùng 1 model, có thể đổi qua env nếu muốn
const MODEL = CLAUDE_SONNET_4_5 || CLAUDE_SONNET_4;

const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
const BASE_URL = process.env.ANTHROPIC_BASE_URL || THIRD_PARTY_BASE_URL;
const API_ENDPOINT = `${BASE_URL}/v1/messages`;

if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY or ANTHROPIC_AUTH_TOKEN');
  process.exit(1);
}

console.log('Using API endpoint:', API_ENDPOINT);
console.log('Using model:', MODEL);

// Base/Head của PR (được set từ workflow/comment handler)
const BASE = process.env.PR_BASE_SHA || 'origin/dev';
const HEAD = process.env.PR_HEAD_SHA || 'HEAD';

// ---- Lấy toàn bộ diff của PR (one-shot) ----
try {
  execSync('git fetch --all --prune', { stdio: 'ignore' });
} catch {}

let diff = '';
try {
  // unified=0: chỉ giữ dòng thay đổi, giảm kích thước prompt
  diff = execSync(`git diff --unified=0 ${BASE}...${HEAD}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
} catch (e) {
  console.error('Failed to get git diff:', e.message);
  process.exit(1);
}

// Nếu không có thay đổi thì thoát sớm
if (!diff || diff.trim().length === 0) {
  writeFileSync(
    'review.md',
    `# AI Code Review (Claude)\n\n> Base: \`${BASE}\` → Head: \`${HEAD}\`\n\n_No code changes detected in diff._\n`,
    'utf8',
  );
  writeFileSync('issues.json', '[]', 'utf8');
  console.log('No diff. Wrote empty review.');
  process.exit(0);
}

// ---- Giới hạn kích thước để tránh token limit ----
// Quy tắc đơn giản: cắt ở ~120k ký tự (tùy backend). Bạn có thể tăng/giảm con số này.
const MAX_PROMPT_CHARS = Number(process.env.MAX_PROMPT_CHARS || 120_000);
let usedDiff = diff;
if (usedDiff.length > MAX_PROMPT_CHARS) {
  console.warn(`Diff length ${usedDiff.length} > ${MAX_PROMPT_CHARS}. Truncating...`);
  // Cắt mềm theo ranh giới "diff --git " gần nhất để đỡ vỡ cấu trúc
  const cut = usedDiff.slice(0, MAX_PROMPT_CHARS);
  const lastHeader = cut.lastIndexOf('\ndiff --git ');
  usedDiff = lastHeader > 0 ? cut.slice(0, lastHeader) : cut;
}

// ---- Prompts ----
const systemPrompt = `
Bạn là senior Node.js reviewer. Ưu tiên:
1) Bảo mật (authz/authn, JWT, secrets, injection, validation, CORS, headers, rate-limit)
2) REST & hợp đồng (status code, schema, idempotency, pagination)
3) Hiệu năng & DB (N+1, index, projection, cache)
4) Ổn định & Observability (logging, error handling, request-id, metrics)
5) Maintainability (clean code, layering)

Hãy xuất 2 phần:
(A) REVIEW_MARKDOWN: nhận xét dạng Markdown (ngắn gọn, actionable, có code patch nếu cần)
(B) ISSUES_JSON: JSON array các finding (MUST be valid JSON, no comments).
`;

const userHeader = `
Repo context:
- Ngôn ngữ: Node.js/TypeScript/Express (giả định)
- Frameworks: Next.js, NestJS.
- Nhiệm vụ: Review **toàn bộ unified git diff của PR** (base...head). Nêu rõ file:line nếu có thể.
- Ghi chú: bỏ qua test/comment/doc/readme/config/ci-cd/scripts khi có thể.

Định dạng bắt buộc:
## REVIEW_MARKDOWN
...(markdown tóm tắt, có bullet)...

## ISSUES_JSON
\`\`\`json
[
  {
    "severity": "Critical|High|Medium|Low",
    "title": "Ngắn gọn, súc tích",
    "file": "relative/path/to/file.js",
    "line": 123,
    "rule": "e.g. JWT.Secret, Input.Validation, REST.StatusCode",
    "description": "Mô tả chi tiết vì sao là vấn đề",
    "recommendation": "Cách sửa/định hướng cụ thể",
    "evidence": "trích đoạn hoặc mô tả ngữ cảnh",
    "cwe": "CWE-xxx (optional)"
  }
]
\`\`\`
`;

// ---- Gọi API đúng 1 lần ----
async function callClaudeOneShot(content) {
  const body = {
    model: MODEL,
    max_tokens: Number(process.env.MAX_TOKENS || 5000),
    temperature: 0.2,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `${userHeader}\n\n### FULL PR DIFF (unified=0)\n\`\`\`\n${content}\n\`\`\``,
      },
    ],
  };

  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseText = await res.text();

  if (!res.ok) {
    console.error(`API Error Status: ${res.status}`);
    console.error(`Response: ${responseText.slice(0, 500)}`);
    throw new Error(`Claude API error: ${res.status}`);
  }

  let json;
  try {
    json = JSON.parse(responseText);
  } catch (e) {
    console.error('Failed to parse JSON response:', responseText.slice(0, 500));
    throw new Error('Invalid JSON response from API');
  }

  const text = (json.content && json.content[0] && json.content[0].text) || '';
  return text;
}

function extractSections(text) {
  const mdIndex = text.indexOf('## REVIEW_MARKDOWN');
  const jsonIndex = text.indexOf('## ISSUES_JSON');
  let md = '';
  let issues = [];
  if (mdIndex !== -1) {
    md = text.slice(mdIndex, jsonIndex !== -1 ? jsonIndex : undefined).trim();
  } else {
    md = text.trim();
  }
  if (jsonIndex !== -1) {
    const after = text.slice(jsonIndex);
    const m = after.match(/```json([\s\S]*?)```/i);
    if (m) {
      try {
        issues = JSON.parse(m[1].trim());
      } catch (e) {
        // bỏ qua nếu JSON hỏng
      }
    }
  }
  return { md, issues };
}

(async () => {
  let answer;
  try {
    answer = await callClaudeOneShot(usedDiff);
  } catch (e) {
    const err = `**Error calling Claude:** ${String(e)}`;
    writeFileSync(
      'review.md',
      `# AI Code Review (Claude)\n\n> Base: \`${BASE}\` → Head: \`${HEAD}\`\n\n${err}\n`,
      'utf8',
    );
    writeFileSync('issues.json', '[]', 'utf8');
    process.exit(1);
  }

  const { md, issues } = extractSections(answer);
  const header = `# AI Code Review (Claude)\n\n> Base: \`${BASE}\` → Head: \`${HEAD}\`\n\n`;
  const reviewAll = `${header}${md || '_No content returned._'}\n`;
  writeFileSync('review.md', reviewAll, 'utf8');

  const cleanIssues = Array.isArray(issues)
    ? issues
        .filter((it) => it && it.title)
        .map((it) => ({
          severity: String(it.severity || 'Medium').trim(),
          title: it.title,
          file: it.file || '',
          line: typeof it.line === 'number' && Number.isInteger(it.line) ? it.line : null,
          rule: it.rule || '',
          description: it.description || '',
          recommendation: it.recommendation || '',
          evidence: it.evidence || '',
          cwe: it.cwe || '',
        }))
    : [];

  writeFileSync('issues.json', JSON.stringify(cleanIssues, null, 2), 'utf8');
  console.log(`Wrote review.md & issues.json with ${cleanIssues.length} findings.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
