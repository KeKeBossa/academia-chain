#!/bin/bash
# 🚀 実行するべきGitコマンド（コピペ用）
# マージ後の実行順序

# ========================================
# Phase 1: リモート最新取得（すぐに実行）
# ========================================
echo "Step 1: リモート更新..."
git fetch academia-chain
git fetch origin

echo ""
echo "========== 現在の状態 =========="
git status
git log --oneline -3

# ========================================
# Phase 2: 変更内容をコミット（未コミット変更がある場合）
# ========================================
# 注: 現在のコード簡潔化変更がステージングされていない場合は以下を実行
# git add .
# git commit -m "refactor: implement code simplification"
# git push academia-chain ac/ui
# git push origin ac/ui

# ========================================
# Phase 3: GitHub で PR を作成
# ========================================
echo ""
echo "📋 GitHub で以下の操作を実施してください："
echo "1. https://github.com/KeKeBossa/academia-chain/pulls にアクセス"
echo "2. 'New pull request' をクリック"
echo "3. base: main, compare: ac/ui を選択"
echo "4. Title: 'refactor: simplify codebase with unified utilities'"
echo "5. 説明を記載して 'Create pull request'"
echo "6. レビュー後、'Merge pull request' をクリック"
echo ""

# ========================================
# Phase 4: GitHub でマージ後に、ローカルを同期
# ========================================
echo ""
echo "Step 4: GitHub でマージ後に実行..."
echo ""
echo "# main ブランチに切り替え"
git checkout main

echo "# リモート main を取得"
git fetch academia-chain main

echo "# ローカル main を更新"
git pull academia-chain main

echo ""
echo "========== マージ完了確認 =========="
git log --oneline -5

# ========================================
# Phase 5: ac/ui ブランチを削除（オプション）
# ========================================
echo ""
echo "Step 5: ac/ui ブランチ削除（オプション）..."
echo "# ローカル ac/ui を削除"
# git branch -d ac/ui

echo "# リモート academia-chain の ac/ui を削除"
# git push academia-chain --delete ac/ui

echo "# リモート origin の ac/ui を削除"
# git push origin --delete ac/ui

# ========================================
# Phase 6: マージ後の検証
# ========================================
echo ""
echo "Step 6: マージ後の検証..."
echo ""
cd academic-chain

echo "# ビルド確認"
npm run build

echo ""
echo "# Lint 確認"
npm run lint

echo ""
echo "# サーバー起動（Ctrl+C で終了）"
npm run dev
