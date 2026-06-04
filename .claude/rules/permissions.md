# 権限ポリシー（サプライチェーン防御）

この環境の権限制御は **2層**。Claude はこの文書で層1 を把握し、層2 を遵守する。

**真実の源は `.claude/settings.local.json` の `permissions`。** 本文書は要約。
矛盾時は settings 実体を正とし、本文書を更新すること。

## 層1: permission（ハーネス強制・迂回不可）

優先順位 `deny > ask > allow`。deny が allow に勝つ。

### deny（外部コード取得を機械的に遮断）

```
Bash(curl:*)        # 任意URL取得
Bash(wget:*)        # 任意URL取得
Bash(git clone:*)   # 外部リポジトリ取得
Bash(npm install:*) # npm経由依存取得（pnpm統一違反）
Bash(npm i:*)
Bash(npm ci:*)
Bash(npm add:*)
Bash(npm exec:*)    # 外部パッケージ即時実行
Bash(yarn:*)        # yarn不採用
Bash(pnpm add:*)    # 新規依存追加は人手に限定
Bash(pnpm dlx:*)    # 外部パッケージ取得+即時実行（pnpm版npx）
Bash(pip install:*)
Bash(brew install:*)
```

### ask（実行前に人の承認）

```
Bash(git push:*) / Bash(git push)
```

### allow（無確認許可）

`pnpm build *` / `npm run *` / `pnpm lint *` / `npx prettier:*` / `git add *` / `git commit *` / `git mv *` 等。実体は settings 参照。

## 層2: 行動ポリシー（Claude 遵守依存・機械強制ナシ）

managed-settings 散文 + 本リポジトリ規約由来。Claude が自発的に従う。

- ホスト Mac で依存インストール禁止 → Dev Container 内で pnpm 使用
- package manager / curl / wget / git clone 等 外部コード取得は **目的・影響を説明してから** 実行
- `--dangerously-skip-permissions` 使用禁止
- パッケージマネージャは pnpm 統一（npm / yarn 不可）

## 環境レベルの防御（参考・Claude 管轄外）

- **依存取得経路**: `registry.npmjs.org` を直接利用。`pnpm-lock.yaml` の sha512 integrity による改ざん検出 + `min-release-age=7`(公開後7日未満を除外) + `ignore-scripts=true`(インストールスクリプト無効化)が供給網防御の主軸
  - ※ 旧構成の `npm.flatt.tech`(Flatt Security のスキャン型プロキシ)は tarball を `registry.npmjs.org` へ 302 リダイレクトする設計で、スキャン経路としても egress 許可ドメインとしても機能せず廃止
- **CI Actions の SHA ピン留め**: `.github/workflows/*` の `uses:` は可変タグでなく commit SHA 固定(コメントにタグ併記)。アクション側侵害時の汚染版引き込みを防止。更新は SHA 単位で

## 既知のギャップ

- `npx` は外部パッケージ即時実行で高リスクだが、`npx prettier`(allow) 維持のため全面 deny せず。未登録 npx は都度プロンプト(`pnpm dlx` / `npm exec` は deny 済)
- `pnpm install`(lockfile 復元) は正規操作 → deny せず。新規追加 `pnpm add` のみ deny
- deny はコマンド名ベース。エイリアス・パス直叩き・スクリプト経由の迂回は完全防御不可 → 層2 遵守と人のレビューで補完

## 新規依存を正規追加する手順

Claude は `pnpm add` 不可。人が Dev Container 内で手動実行:

```bash
pnpm add <pkg>   # 目的・供給元を確認後、人手で
```
