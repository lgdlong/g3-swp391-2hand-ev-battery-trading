// Post review.md vào PR comment
import { readFileSync } from "node:fs";
const token = process.env.GITHUB_TOKEN;
const prNumber = process.env.PR_NUMBER;
const repo = process.env.GITHUB_REPOSITORY || process.env.REPO;

if (!token || !prNumber || !repo) {
  console.error("Missing GITHUB_TOKEN / PR_NUMBER / REPO");
  process.exit(1);
}

const body = readFileSync("review.md", "utf8");
const url = `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`;

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  },
  body: JSON.stringify({ body }),
});

if (!res.ok) {
  console.error("Failed to post PR comment:", res.status, await res.text());
  process.exit(1);
}
console.log("Posted PR comment.");
