#!/usr/bin/env node

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const fs = require("fs");
const path = require("path");
const { z } = require("zod");

// Load errors data
const dataPath = path.join(__dirname, "..", "data", "errors.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Search helper (reuses logic from api/search.js)
function searchErrors(query) {
  const q = query.toLowerCase().trim();
  const results = [];
  for (const cat of data.categories) {
    for (const err of cat.errors) {
      const searchText = [
        err.title,
        ...err.symptoms,
        err.cause,
        ...err.solutions.map((s) => s.title),
      ]
        .join(" ")
        .toLowerCase();
      if (q.split(/\s+/).every((term) => searchText.includes(term))) {
        results.push({ category: cat.name, categoryId: cat.id, ...err });
      }
    }
  }
  return results;
}

// Format error to markdown
function formatError(err) {
  let md = `## ${err.title}\n`;
  md += `**ID:** ${err.id} | **심각도:** ${err.severity}\n\n`;
  if (err.category) md += `**카테고리:** ${err.category}\n\n`;
  md += `### 증상\n${err.symptoms.map((s) => `- ${s}`).join("\n")}\n\n`;
  md += `### 원인\n${err.cause}\n\n`;
  md += `### 해결방법\n`;
  for (const sol of err.solutions) {
    md += `\n#### 방법 ${sol.method}: ${sol.title}\n`;
    md += "```\n" + sol.steps.join("\n") + "\n```\n";
  }
  return md;
}

// Create MCP server
const server = new McpServer({
  name: "openclaw-error-guide",
  version: "1.0.0",
});

// Tool: search_errors
server.tool(
  "search_errors",
  "OpenClaw 오류를 키워드로 검색합니다. 제목, 증상, 원인에서 검색합니다.",
  { query: z.string().describe("검색 키워드 (예: 'PowerShell', 'EACCES', 'proxy')") },
  async ({ query }) => {
    const results = searchErrors(query);
    if (results.length === 0) {
      return { content: [{ type: "text", text: `"${query}"에 대한 검색 결과가 없습니다.` }] };
    }
    const md = `# 검색 결과: "${query}" (${results.length}건)\n\n` + results.map(formatError).join("\n---\n\n");
    return { content: [{ type: "text", text: md }] };
  }
);

// Tool: list_categories
server.tool(
  "list_categories",
  "모든 오류 카테고리와 각 카테고리의 오류 수를 표시합니다.",
  {},
  async () => {
    let md = `# OpenClaw 오류 카테고리\n\n`;
    md += `총 ${data.metadata.totalErrors}개 오류, ${data.metadata.totalSolutions}개 해결방법\n\n`;
    md += `| 카테고리 ID | 이름 | 오류 수 |\n|---|---|---|\n`;
    for (const cat of data.categories) {
      md += `| ${cat.id} | ${cat.name} | ${cat.errors.length} |\n`;
    }
    return { content: [{ type: "text", text: md }] };
  }
);

// Tool: get_category
server.tool(
  "get_category",
  "특정 카테고리의 모든 오류와 해결방법을 가져옵니다.",
  { categoryId: z.string().describe("카테고리 ID (예: 'windows', 'macos', 'network')") },
  async ({ categoryId }) => {
    const cat = data.categories.find((c) => c.id === categoryId);
    if (!cat) {
      const ids = data.categories.map((c) => c.id).join(", ");
      return { content: [{ type: "text", text: `카테고리 "${categoryId}"를 찾을 수 없습니다. 사용 가능: ${ids}` }] };
    }
    const md = `# ${cat.name} (${cat.errors.length}개 오류)\n\n` +
      cat.errors.map((err) => formatError({ ...err, category: cat.name })).join("\n---\n\n");
    return { content: [{ type: "text", text: md }] };
  }
);

// Tool: get_error
server.tool(
  "get_error",
  "특정 오류의 상세 정보와 모든 해결방법을 가져옵니다.",
  { errorId: z.string().describe("오류 ID (예: 'win-1', 'mac-3', 'net-2')") },
  async ({ errorId }) => {
    for (const cat of data.categories) {
      const err = cat.errors.find((e) => e.id === errorId);
      if (err) {
        return { content: [{ type: "text", text: formatError({ ...err, category: cat.name }) }] };
      }
    }
    return { content: [{ type: "text", text: `오류 "${errorId}"를 찾을 수 없습니다.` }] };
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
