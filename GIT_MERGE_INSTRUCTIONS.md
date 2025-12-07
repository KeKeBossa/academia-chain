# マージ後のGitコマンド手順

## 📋 現在の状態

```
✅ ac/ui ブランチ: コード簡潔化実装済み（7つのユーティリティ）
✅ リモート同期: academia-chain/ac/ui に同期済み
⏳ マージ待ち: ac/ui → main へのマージ（GitHub PR での実施推奨）
```

---

## 🔄 Git コマンド実行順序

### **フェーズ1: リモートの最新状態を取得**

```bash
# academia-chain リモートを更新
git fetch academia-chain ac/ui
git fetch academia-chain main

# origin（GitHub）を更新
git fetch origin ac/ui
git fetch origin main
```

**目的**: ローカルブランチとリモートの差分を確認

---

### **フェーズ2: ローカルの ac/ui を最新に更新（必要に応じて）**

```bash
# ac/ui ブランチが古い場合
git checkout ac/ui
git pull academia-chain ac/ui

# または（強制同期が必要な場合）
git fetch academia-chain ac/ui
git reset --hard academia-chain/ac/ui
```

**目的**: ローカルと リモートのac/uiを完全に同期

---

### **フェーズ3: 変更をコミット（未コミット変更がある場合）**

```bash
# 現在のステータス確認
git status

# 必要に応じてコミット
git add .
git commit -m "feat: simplify codebase with unified utilities

- Create API config (src/config/api.ts)
- Create generic fetch utility (src/utils/api.ts)
- Refactor useData.ts with apiFetch pattern (~150 lines)
- Consolidate type transformers (src/utils/transformers.ts)
- Extract form utilities (src/utils/forms.ts)
- Unify toast handlers (src/utils/toast.ts)
- Create stats utilities (src/utils/stats.ts)
- Standardize error handling (src/utils/errors.ts)"

# リモートにプッシュ
git push academia-chain ac/ui
git push origin ac/ui
```

**目的**: すべての変更をリモートに同期

---

### **フェーズ4: GitHub で PR を作成・マージ（推奨方法）**

#### 4.1 PR 作成
```bash
# GitHub の Web UI から実施
1. https://github.com/KeKeBossa/academia-chain/pulls へアクセス
2. "New pull request" をクリック
3. base: main, compare: ac/ui を選択
4. Title: "refactor: simplify codebase with unified utilities"
5. Description に変更内容を記載
6. "Create pull request" をクリック
```

#### 4.2 PR レビュー・マージ
```bash
# GitHub の Web UI で実施
1. PR コメントを確認
2. "Merge pull request" をクリック
3. マージ方法を選択：
   - "Create a merge commit" (推奨) - 履歴が明確
   - "Squash and merge" - コミット数を削減
   - "Rebase and merge" - 履歴を整理
```

---

### **フェーズ5: ローカルで main をマージする（ローカル実施の場合）**

```bash
# main ブランチをチェックアウト
git checkout main

# リモートの main の最新を取得
git pull academia-chain main

# ac/ui をマージ
git merge ac/ui --no-ff \
  -m "Merge branch 'ac/ui' into main: code simplification

Merge includes:
- 7 new utility files (600+ lines)
- 3 refactored components
- ~300 lines of duplicate code consolidated
- Improved maintainability and reusability"

# リモートにプッシュ
git push academia-chain main
git push origin main
```

**オプション**:
- `--no-ff`: マージコミットを必ず作成（履歴が明確）
- `-m`: コミットメッセージを指定

---

### **フェーズ6: マージ後にローカルを同期**

```bash
# 現在が ac/ui の場合、main に切り替え
git checkout main

# リモートから最新を取得
git pull academia-chain main
git pull origin main

# ローカルの状態確認
git log --oneline -5
```

---

### **フェーズ7: 不要なローカルブランチを削除（オプション）**

```bash
# マージ完了後、ac/ui ブランチを削除
git branch -d ac/ui

# 削除を確認
git branch -a
```

**注意**: GitHub で PR がマージされるまで削除しないこと

---

### **フェーズ8: リモートのブランチを削除（オプション）**

```bash
# GitHub で PR がマージされた場合のみ実施
git push academia-chain --delete ac/ui
git push origin --delete ac/ui

# 削除を確認
git branch -r
```

---

## 📊 マージ後の状態確認

```bash
# ブランチ確認
git branch -a

# log 確認（新しいマージコミットが表示される）
git log --oneline --graph --decorate -10

# 現在のブランチ
git branch -v

# リモート追跡ブランチ
git branch -r
```

---

## 🚨 トラブルシューティング

### ケース1: コンフリクトが発生した場合

```bash
# コンフリクト箇所を確認
git status

# コンフリクト内容を確認
git diff

# エディタで解決
# （<<<< ==== >>>> の部分を手動修正）

# 解決後、ステージング
git add .

# マージコミットを完成
git commit --no-edit  # または -m "メッセージ"

# リモートにプッシュ
git push academia-chain main
```

### ケース2: マージをキャンセルしたい場合

```bash
# マージ前のキャンセル
git merge --abort

# マージ後のロールバック
git revert <マージコミットのハッシュ>
```

### ケース3: リモートが古い場合

```bash
# リモートの設定を確認
git remote -v

# リモートを最新に同期
git remote update

# ローカルをリモートに強制同期（危険：既存の変更が失われる）
git fetch academia-chain ac/ui
git reset --hard academia-chain/ac/ui
```

---

## ✅ チェックリスト

マージ後に確認すべき項目：

```bash
# 1. main ブランチにいることを確認
git branch

# 2. マージコミットが表示される
git log --oneline -3

# 3. ac/ui のコミットが main に含まれている
git log --oneline ac/ui..main  # 空出力 = 同じ状態

# 4. 新しいファイルが存在する
ls -la academic-chain/src/config/api.ts
ls -la academic-chain/src/utils/*.ts

# 5. ビルド確認
cd academic-chain
npm run build

# 6. Lint 確認
npm run lint

# 7. サーバー起動確認
npm run dev
```

---

## 📝 推奨される PR マージ戦略

### **「Create a merge commit」を推奨する理由**

```
✅ メリット:
- マージ履歴が明確に残る
- 問題が発生した場合のロールバックが簡単
- PR と main の関係が明確

❌ デメリット:
- コミット履歴が増える
```

### **PR マージ後のコマンド例**

```bash
# GitHub で PR をマージした後

# ローカルを同期
git fetch academia-chain
git checkout main
git pull academia-chain main

# ac/ui ブランチは削除してOK
git branch -d ac/ui
```

---

## 🎯 まとめ

| ステップ | コマンド | 実施場所 |
|--------|--------|--------|
| 1. リモート更新 | `git fetch academia-chain` | ローカル |
| 2. ローカル同期 | `git pull academia-chain ac/ui` | ローカル |
| 3. 変更確認 | `git status` | ローカル |
| 4. PR 作成 | GitHub Web UI | GitHub |
| 5. PR マージ | GitHub Web UI | GitHub |
| 6. main 同期 | `git pull academia-chain main` | ローカル |
| 7. ブランチ削除 | `git branch -d ac/ui` | ローカル |
| 8. 検証 | `npm run build` | ローカル |

---

## 参考リンク

- [Git Documentation - git merge](https://git-scm.com/docs/git-merge)
- [GitHub - Creating a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- [GitHub - Merging a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request)
