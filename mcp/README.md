# OpenClaw Error Guide MCP Server

AI 에이전트(Claude Code, Cursor 등)가 OpenClaw 오류 해결 가이드를 검색하고 조회할 수 있는 MCP 서버입니다.

## 제공 도구

| 도구 | 설명 |
|------|------|
| `search_errors` | 키워드로 오류 검색 (제목, 증상, 원인) |
| `list_categories` | 모든 오류 카테고리 목록 조회 |
| `get_category` | 특정 카테고리의 모든 오류 조회 |
| `get_error` | 특정 오류 ID로 상세 정보 조회 |

## 설정 방법

### Claude Code

`~/.claude.json` 또는 프로젝트의 `.mcp.json`:

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

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

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

### Cursor

프로젝트의 `.cursor/mcp.json`:

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

## 로컬 테스트

```bash
cd mcp
npm install
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"clientInfo":{"name":"test","version":"1.0"},"protocolVersion":"2025-03-26"}}' | node index.js
```
