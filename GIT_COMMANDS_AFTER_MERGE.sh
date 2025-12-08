#!/bin/bash
# Git Commands After Merge - マージ後のgitコマンド手順

echo "=========================================="
echo "Step 1: リモートの最新状態を取得"
echo "=========================================="
# 現在の ac/ui ブランチの最新状態を確認
git fetch academia-chain ac/ui
git fetch origin ac/ui

echo ""
echo "=========================================="
echo "Step 2: ローカルブランチを更新（必要な場合）"
echo "=========================================="
# ac/ui ブランチが古い場合、リモートから更新
git pull academia-chain ac/ui

echo ""
echo "=========================================="
echo "Step 3: 変更をコミット（未コミット変更がある場合）"
echo "=========================================="
# 変更内容を確認
git status

# 必要に応じてコミット
# git add .
# git commit -m "メッセージ"

echo ""
echo "=========================================="
echo "Step 4: main ブランチにマージするための準備"
echo "=========================================="
# main ブランチの最新状態を取得
git fetch academia-chain main
git fetch origin main

echo ""
echo "=========================================="
echo "Step 5: ac/ui から main へマージ（リモート側で実施）"
echo "=========================================="
# GitHub で PR を作成してマージするか、以下コマンドで実施
# （ローカルでマージする場合）
# git checkout main
# git pull academia-chain main
# git merge ac/ui --no-ff -m "Merge: Code simplification (7 utilities)"

echo ""
echo "=========================================="
echo "Step 6: マージ後にローカルを同期"
echo "=========================================="
# main ブランチをチェックアウト
# git checkout main

# リモートの main に同期
# git pull academia-chain main

echo ""
echo "=========================================="
echo "Step 7: 不要なローカルブランチを削除（オプション）"
echo "=========================================="
# マージ完了後、不要なブランチを削除
# git branch -d ac/ui

echo ""
echo "=========================================="
echo "Step 8: リモートのブランチを削除（オプション）"
echo "=========================================="
# リモートのブランチも削除（PR マージ後）
# git push academia-chain --delete ac/ui

echo ""
echo "=========================================="
echo "実行済みコマンドの確認"
echo "=========================================="
git log --oneline -10
