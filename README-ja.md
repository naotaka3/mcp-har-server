# MCP HAR Server

HAR（HTTP Archive）ファイルを解析し、リクエストを簡潔な形式で表示するModel Context Protocol（MCP）サーバーです。このツールは、MCPプロトコルを通じてAIアシスタントと連携することを目的としています。

## 機能

- HARファイルを解析してリクエスト/レスポンス情報を抽出
- ハッシュ識別子を使用してリクエストを表示し、簡単に参照可能
- クエリパラメータの表示切り替え
- ステータスコード、メソッド、URLパターン、または特定のドメインを除外してリクエストをフィルタリング
- 特定のリクエストの詳細なヘッダーとボディ情報を表示
- HARファイルから一意のドメインをリストアップしてフィルタリングを支援

## 利用可能なツール

### har_viewer

ハッシュ識別子を使用してHARファイルのリクエストを簡潔な形式で表示します。結果を絞り込むためのフィルタリングオプションが含まれています。

### har_detail

ハッシュ識別子を使用して特定のHARファイルエントリの詳細情報（ヘッダーとリクエスト/レスポンスボディを含む）を提供します。

### domain_list

HARファイル内で見つかったすべての一意のドメインをリストアップし、出力量の削減とフィルタリングオプションの提供に役立ちます。

## Claude Desktopでの使用方法

Claude Desktopでこのサーバーを使用するには、`claude_desktop_config.json`に以下の設定を追加してください：

設定ファイル `claude_desktop_config.json` は以下の場所にあります。
設定を変更した後は、Claude Desktopを再起動してください。

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

### npxを使用する場合

```json
{
  "mcpServers": {
    "mcp-har-server": {
      "command": "npx",
      "args": [
        "-y",
        "@naotaka/mcp-har-server@latest"
      ]
    }
  }
}
```

### buildする場合

```json
{
  "mcpServers": {
    "mcp-har-server": {
      "command": "node",
      "args": [
        "/path/to/mcp-har-server/build/index.js"
      ]
    }
  }
}
```

## 使用方法

### HARビューアツール

HARビューアツールはMCPプロトコルを通じてアクセスできます。使用例は以下の通りです：

```javascript
// MCPプロトコルでの使用例
const result = await mcpClient.callTool('har_viewer', {
  filePath: '/path/to/your/file.har',
  showQueryParams: true, // クエリパラメータを非表示にする場合はfalseに設定
  filter: {
    statusCode: 200, // オプション: ステータスコードでフィルタリング
    method: 'GET', // オプション: HTTPメソッドでフィルタリング
    urlPattern: 'api', // オプション: URLパターンでフィルタリング
    excludeDomains: ['cdn.example.com', 'analytics.example.com'], // オプション: 特定のドメインを除外
  },
});
```

HARビューア出力例

`showQueryParams: true` の場合：

```text
[abc123] 200 GET https://example.com/api/users?page=1&limit=10
[def456] 404 POST https://api.example.org/data/process?format=json&version=2.1
[ghi789] 500 PUT https://service.example.net/update?id=12345&token=abc123
```

`showQueryParams: false` の場合：

```text
[abc123] 200 GET https://example.com/api/users
[def456] 404 POST https://api.example.org/data/process
[ghi789] 500 PUT https://service.example.net/update
```

### HAR詳細ツールの使用

HAR詳細ツールを使用すると、HARファイル内の特定のリクエストに関する詳細情報を表示できます。ヘッダーと、オプションでボディコンテンツを確認できます：

```javascript
// MCPプロトコルでの使用例
const result = await mcpClient.callTool('har_detail', {
  filePath: '/path/to/your/file.har',
  hashes: 'abc123', // 単一のハッシュまたは 'abc123,def456,ghi789' のようなカンマ区切りのリスト
  showBody: true, // リクエスト/レスポンスボディを非表示にする場合はfalseに設定
});
```

HAR詳細出力例

```text
ENTRY [abc123]
=== REQUEST ===
GET https://example.com/api/users?page=1&limit=10

--- Headers ---
Accept: application/json
User-Agent: Mozilla/5.0

=== RESPONSE ===
200 OK

--- Headers ---
Content-Type: application/json
Cache-Control: no-cache

--- Body ---
{
  "users": [
    {
      "id": 1,
      "name": "John Doe"
    },
    {
      "id": 2,
      "name": "Jane Smith"
    }
  ],
  "page": 1,
  "total": 42
}
```

### ドメインリストツールの使用

ドメインリストツールは、HARファイル内のすべての一意のドメインを表示し、フィルタリングに役立ちます：

```javascript
// MCPプロトコルでの使用例
const result = await mcpClient.callTool('domain_list', {
  filePath: '/path/to/your/file.har',
});
```

ドメインリスト出力例

```text
example.com
api.example.org
service.example.net
cdn.example.com
analytics.example.com
```

## 開発

### インストール

```bash
# 依存関係をインストール
npm ci
```

### ビルドとテスト

```bash
# プロジェクトをビルド
npm run build

# テストを実行
npm test
```

## MCPについて

このツールは、AIアシスタントが外部のツールやサービスと連携できるModel Context Protocol（MCP）を使用しています。MCPの詳細については [https://github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk) をご覧ください。

## ライセンス

MIT
