// Tạo GitHub Issues cho các finding High/Critical, tránh nhân đôi
import { readFileSync } from "node:fs";

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY || process.env.REPO;
const prNumber = process.env.PR_NUMBER;
const prUrl = process.env.PR_URL;

if (!token || !repo) {
  console.error("Missing GITHUB_TOKEN / REPO");
  process.exit(1);
}

const findings = JSON.parse(readFileSync("issues.json", "utf8"));
const severe = findings.filter((f) =>
  ["critical", "high"].includes(String(f.severity || "").toLowerCase())
);

if (!severe.length) {
  console.log("No High/Critical issues to file.");
  process.exit(0);
}

// Helper: tạo label nếu chưa có
async function ensureLabel(
  name,
  color = "B60205",
  description = "AI review finding"
) {
  const url = `https://api.github.com/repos/${repo}/labels/${encodeURIComponent(
    name
  )}`;
  const get = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (get.status === 200) return;
  const create = await fetch(`https://api.github.com/repos/${repo}/labels`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ name, color, description }),
  });
  if (!create.ok) {
    console.warn("Failed to create label", name, await create.text());
  }
}

// Helper: tìm issue trùng (theo title)
async function searchExisting(title) {
  const q = `repo:${repo} is:issue in:title "${title.replace(/"/g, '\\"')}"`;
  const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).filter((it) => it.state === "open");
}

// Tạo/đính label
await ensureLabel("ai-review", "0E8A16", "AI review created");
await ensureLabel("severity:high", "D93F0B", "High severity");
await ensureLabel("severity:critical", "B60205", "Critical severity");

let created = 0;
for (const f of severe) {
  const title = `[AI Review] ${f.title}`;
  const dup = await searchExisting(title);
  if (dup.length) {
    console.log("Skip duplicate:", title);
    continue;
  }

  const labels = ["ai-review"];
  const sev = String(f.severity || "").toLowerCase();
  if (sev === "critical") labels.push("severity:critical");
  if (sev === "high") labels.push("severity:high");

  const body = [
    `**Severity:** ${f.severity}`,
    f.rule ? `**Rule:** ${f.rule}` : null,
    f.file ? `**Location:** \`${f.file}${f.line ? ":" + f.line : ""}\`` : null,
    "",
    "### Description",
    f.description || "(no description)",
    "",
    "### Recommendation",
    f.recommendation || "(no recommendation)",
    "",
    f.evidence ? "### Evidence\n```\n" + f.evidence + "\n```" : null,
    prUrl ? `\nLinked PR: ${prUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://api.github.com/repos/${repo}/issues`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({ title, body, labels }),
  });

  if (res.ok) {
    created++;
    console.log("Created issue:", title);
  } else {
    console.warn("Failed to create issue:", title, await res.text());
  }
}

console.log(`Done. Created ${created} issue(s).`);
