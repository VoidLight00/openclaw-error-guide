# OpenClaw Error Guide MCP Server

AI 에이전트(Claude Code, Cursor 등)가 OpenClaw 오류 해결 가이드를 검색하고 조회할 수 있는 MCP 서버입니다.

## 빠른 시작

### 1. 레포 클론 & 의존성 설치

```bash
git clone https://github.com/VoidLight00/openclaw-error-guide.git
cd openclaw-error-guide/mcp
npm install
```

### 2. 설치 경로 확인

> **⚠️ 중요:** 아래 설정에서 `/path/to/` 부분을 반드시 **실제 클론한 경로**로 변경하세요!
>
> 예시:
> - macOS: `/Users/username/projects/openclaw-error-guide/mcp/index.js`
> - Linux: `/home/username/openclaw-error-guide/mcp/index.js`
> - WSL: `/home/username/openclaw-error-guide/mcp/index.js`
>
> 실제 경로 확인 방법:
> ```bash
> cd openclaw-error-guide/mcp
> echo "$(pwd)/index.js"
> ```
> 출력된 경로를 그대로 복사해서 아래 설정에 붙여넣으세요.

### 3. AI 도구에 등록

#### Claude Desktop

설정 파일 위치:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "openclaw-errors": {
      "command": "node",
      "args": ["/Users/username/projects/openclaw-error-guide/mcp/index.js"]
    }
  }
}
```

> ⚠️ `"/Users/username/projects/"` 부분을 본인 경로로 변경하세요!

#### Claude Code

`~/.claude.json` 또는 프로젝트의 `.mcp.json`:

```json
{
  "mcpServers": {
    "openclaw-errors": {
      "command": "node",
      "args": ["/Users/username/projects/openclaw-error-guide/mcp/index.js"]
    }
  }
}
```

> ⚠️ `"/Users/username/projects/"` 부분을 본인 경로로 변경하세요!

#### Cursor

프로젝트의 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "openclaw-errors": {
      "command": "node",
      "args": ["/Users/username/projects/openclaw-error-guide/mcp/index.js"]
    }
  }
}
```

> ⚠️ `"/Users/username/projects/"` 부분을 본인 경로로 변경하세요!

### 4. 재시작

설정 저장 후 Claude Desktop / Cursor를 **완전히 종료 후 재시작**하세요.

## 제공 도구

| 도구 | 설명 | 입력 예시 |
|------|------|-----------|
| `search_errors` | 키워드로 오류 검색 (제목, 증상, 원인) | `{"query": "EACCES"}` |
| `list_categories` | 모든 오류 카테고리 목록 조회 | (없음) |
| `get_category` | 특정 카테고리의 모든 오류 조회 | `{"categoryId": "windows"}` |
| `get_error` | 특정 오류 ID로 상세 정보 조회 | `{"errorId": "win-1"}` |

## 테스트

설치가 잘 되었는지 터미널에서 확인:

```bash
cd openclaw-error-guide/mcp
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{},"clientInfo":{"name":"test","version":"1.0"},"protocolVersion":"2024-11-05"}}' | node index.js
```

정상이면 아래와 같은 JSON 응답이 나옵니다:
```json
{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"openclaw-error-guide","version":"1.0.0"}},"jsonrpc":"2.0","id":1}
```

## 흔한 문제

### `Cannot find module '/path/to/openclaw-error-guide/mcp/index.js'`
**원인:** 설정 파일에서 경로를 실제 경로로 변경하지 않았습니다.
**해결:** `echo "$(pwd)/index.js"` 로 실제 경로를 확인한 뒤, 설정 파일의 args 값을 교체하세요.

### `Cannot find module '@modelcontextprotocol/sdk'`
**원인:** npm 의존성이 설치되지 않았습니다.
**해결:** `cd mcp && npm install`

### MCP 서버가 목록에 안 나옴
**원인:** 설정 파일 저장 후 앱을 재시작하지 않았습니다.
**해결:** Claude Desktop / Cursor를 완전히 종료 후 다시 시작하세요.
