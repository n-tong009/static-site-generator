#!/usr/bin/env bash

# エラー発生時に即終了し、未定義変数の使用やパイプ内エラーも検知する
set -euo pipefail

# 比較対象のブランチ/コミットを決定する
# 優先順位: 第1引数 > BASE_REF 環境変数 > origin/main
base_ref="${1:-${BASE_REF:-origin/main}}"

# 指定された比較対象が Git 上に存在するか確認する
if ! git rev-parse --verify --quiet "${base_ref}^{commit}" >/dev/null; then
  echo "Base ref not found: ${base_ref}" >&2
  echo "Usage: bash scripts/security/check-sensitive-diff.sh [BASE_REF]" >&2
  exit 2
fi

# 比較対象との差分、ステージ済み、未ステージ、未追跡ファイルをまとめて取得する
# sort -u により重複したファイルパスを除去する
changed_files="$(
  {
    git diff --name-only "${base_ref}...HEAD"
    git diff --name-only --cached
    git diff --name-only
    git ls-files --others --exclude-standard
  } | sort -u
)"

# 変更ファイルが存在しない場合は正常終了する
if [[ -z "${changed_files}" ]]; then
  echo "No file changes detected against ${base_ref}."
  exit 0
fi

# 機密性・影響範囲が大きいファイルの変更を格納する配列
matches=()

# 変更ファイルの中に、手動レビューが必要な重要ファイルが含まれているか確認する
while IFS= read -r file; do
  case "${file}" in
    .github/workflows/* | \
    .vscode/* | \
    .claude/* | \
    package.json | \
    package-lock.json | \
    npm-shrinkwrap.json | \
    pnpm-lock.yaml | \
    yarn.lock | \
    bun.lock | \
    bun.lockb | \
    Cargo.toml | \
    Cargo.lock | \
    src-tauri/tauri.conf.json)
      matches+=("${file}")
      ;;
  esac
done <<< "${changed_files}"

# 重要ファイルの変更がなければ正常終了する
if ((${#matches[@]} == 0)); then
  echo "No sensitive file changes detected against ${base_ref}."
  exit 0
fi

# 重要ファイルの変更がある場合は一覧を表示し、手動確認を促す
echo "Sensitive file changes detected against ${base_ref}:"
printf ' - %s\n' "${matches[@]}"
echo
echo "Review these changes manually before merging."

# CI などで検知できるように異常終了する
exit 1
