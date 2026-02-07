# OpenClaw Error Guide

OpenClaw 설치 및 설정 오류 해결 가이드. 66개 에러, 137개 솔루션.

**Live:** https://openclaw-error-guide.vercel.app

## Build

```bash
npm run build    # Generates static HTML + llms.txt
npm run dev      # Build + local server
```

## AI Access

### llms.txt

LLM-friendly plain text versions of the guide:

- `https://openclaw-error-guide.vercel.app/llms.txt` — Summary
- `https://openclaw-error-guide.vercel.app/llms-full.txt` — Full reference

### API Endpoints

```
GET /api/search?q=EACCES          # Search errors
GET /api/errors                    # All errors
GET /api/errors?category=windows   # Errors by category
```

All endpoints return JSON with CORS headers enabled.

### Skill (for OpenClaw agents)

The `skill/` folder contains a self-contained OpenClaw skill:

```bash
node skill/search.js "EACCES"
node skill/search.js "Telegram"
```

Install by pointing your agent's skill directory to `skill/`.

## MCP Server (AI 에이전트용)

`mcp/` 폴더에 MCP(Model Context Protocol) 서버가 포함되어 있어 Claude Code, Cursor 등의 AI 에이전트에서 직접 오류를 검색할 수 있습니다.

**제공 도구:** `search_errors`, `list_categories`, `get_category`, `get_error`

설정 예시 (`.mcp.json` 또는 Claude Desktop config):

```json
{
  "mcpServers": {
    "openclaw-errors": {
      "command": "node",
      "args": ["/path/to/openclaw-error-guide/mcp/index.js"]
    }
  }
}
```

자세한 설정 방법은 [mcp/README.md](mcp/README.md)를 참고하세요.

## Project Structure

```
data/errors.json      # Error database
build.js              # Static HTML generator
generate-llms.js      # llms.txt generator
api/search.js         # Search API (Vercel serverless)
api/errors.js         # Errors API (Vercel serverless)
skill/                # OpenClaw skill package
mcp/                  # MCP server for AI agents
public/               # Generated static site
```
