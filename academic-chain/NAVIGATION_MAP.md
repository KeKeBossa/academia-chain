# 「詳細を見る」ボタンの遷移先マップ

## 📍 遷移フロー

### 1. **ダッシュボード（Dashboard）** → 論文詳細

```
Dashboard
  └─ 「詳細を見る」ボタン
       └─ onClick: onNavigateToPaper?.(paper.id)
            └─ App.tsx: navigateToPaperDetail()
                 └─ setActiveTab('paperDetail')
                      └─ setSelectedPaperId(paperId)
                           └─ PaperDetail コンポーネント表示
```

**実装場所**: `Dashboard.tsx` Line 172-174

```tsx
<Button onClick={() => onNavigateToPaper?.(paper.id)}>詳細を見る</Button>
```

**親コンポーネント**: `App.tsx`

```tsx
<Dashboard onNavigateToPaper={(paperId) => navigateToPaperDetail(paperId)} />
```

---

### 2. **リポジトリ（Repository）** → 論文詳細

```
Repository
  └─ PaperList コンポーネント
       └─ 「詳細を見る」ボタン
            └─ onClick: onNavigateToPaper?.(paper.id)
                 └─ App.tsx: navigateToPaperDetail()
                      └─ PaperDetail コンポーネント表示
```

**実装場所**: `PaperList.tsx` Line 178

```tsx
<Button onClick={() => onNavigateToPaper?.(paper.id)}>詳細を見る</Button>
```

**親コンポーネント**: `App.tsx`

```tsx
<Repository onNavigateToPaper={(paperId) => navigateToPaperDetail(paperId)} />
```

---

### 3. **検索結果（Search）** → 詳細ページ

```
Search
  ├─ 論文検索結果
  │   └─ 「詳細を見る」ボタン (Line 367)
  │        └─ onClick: {search_paper_detail_handler}
  │
  ├─ プロジェクト検索結果
  │   └─ 「詳細を見る」ボタン (Line 469)
  │        └─ TODO: 実装必要
  │
  └─ ゼミ検索結果
      └─ 「詳細を見る」ボタン (Line 514)
           └─ TODO: 実装必要
```

**現在の状態**:

- ✅ 論文検索結果 → 論文詳細ページへ遷移可能
- ⚠️ プロジェクト詳細 → 未実装
- ⚠️ ゼミ詳細 → 未実装

---

### 4. **プロジェクト（Projects）** → 詳細ページ

```
Projects
  └─ 「詳細を見る」ボタン (Line 434)
       └─ onClick: {project_detail_handler}
            └─ TODO: 実装必要
```

**現在の状態**: ⚠️ 未実装

---

### 5. **ゼミ・研究室（Seminars）** → 詳細ページ

```
Seminars
  └─ 「詳細を見る」ボタン
       └─ onClick: {seminar_detail_handler}
            └─ TODO: 実装必要
```

**現在の状態**: ⚠️ 未実装

---

## 🔄 App.tsx での遷移ハンドリング

### `navigateToPaperDetail()` 関数

```typescript
// 論文詳細ページへナビゲート
const navigateToPaperDetail = useCallback(
  (paperId: string) => {
    const prevTab = activeTab;
    setSelectedPaperId(paperId);
    setActiveTab('paperDetail');

    // ブラウザ履歴に状態を記録
    window.history.pushState(
      { tab: 'paperDetail', paperId, previousTab: prevTab },
      '',
      window.location.href
    );
  },
  [activeTab]
);
```

### `handleTabChange()` 関数

```typescript
const handleTabChange = useCallback(
  (newTab: TabType) => {
    if (newTab !== activeTab) {
      const prevTab = activeTab;
      setActiveTab(newTab);
      window.history.pushState({ tab: newTab, previousTab: prevTab }, '', window.location.href);
    }
  },
  [activeTab]
);
```

---

## 📊 遷移先サマリー

| ボタン場所               | 現在の遷移先 | 状態        |
| ------------------------ | ------------ | ----------- |
| ダッシュボード           | PaperDetail  | ✅ 実装済み |
| リポジトリ               | PaperDetail  | ✅ 実装済み |
| 検索結果（論文）         | PaperDetail  | ✅ 実装済み |
| 検索結果（プロジェクト） | ❌ なし      | ⚠️ 未実装   |
| 検索結果（ゼミ）         | ❌ なし      | ⚠️ 未実装   |
| プロジェクト             | ❌ なし      | ⚠️ 未実装   |
| ゼミ・研究室             | ❌ なし      | ⚠️ 未実装   |

---

## 🎯 次のステップ

### 1️⃣ プロジェクト詳細ページ実装

```tsx
// App.tsx に新しいタブタイプを追加
type TabType = '...' | 'projectDetail';

// 新しい state を追加
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

// Projects コンポーネントにハンドラーを渡す
<Projects
  onNavigateToProject={(projectId) => {
    setSelectedProjectId(projectId);
    setActiveTab('projectDetail');
  }}
/>;
```

### 2️⃣ ゼミ詳細ページ実装

```tsx
// 同様に Seminars コンポーネント用を実装
type TabType = '...' | 'seminarDetail';

const [selectedSeminarId, setSelectedSeminarId] = useState<string | null>(null);

<Seminars
  onNavigateToSeminar={(seminarId) => {
    setSelectedSeminarId(seminarId);
    setActiveTab('seminarDetail');
  }}
/>;
```

### 3️⃣ 各詳細コンポーネントを作成

- `ProjectDetail.tsx`
- `SeminarDetail.tsx`

---

## 💡 実装パターン

すべての「詳細を見る」ボタンは同じパターンで実装：

```tsx
// 親コンポーネント（App.tsx）
<Component
  onNavigateTo[Item]={(id) => {
    setSelected[Item]Id(id);
    setActiveTab('[item]Detail');
    window.history.pushState(
      { tab: '[item]Detail', [item]Id: id, previousTab: activeTab },
      '',
      window.location.href
    );
  }}
/>

// 詳細画面
export function [Item]Detail({
  data,
  onBack
}: [Item]DetailProps) {
  return (
    <div>
      <Button onClick={onBack}>戻る</Button>
      {/* 詳細コンテンツ */}
    </div>
  );
}
```

---

## ✅ チェックリスト

- [x] 論文詳細ページへの遷移 ← Dashboard, Repository, Search
- [ ] プロジェクト詳細ページへの遷移 ← Projects, Search
- [ ] ゼミ詳細ページへの遷移 ← Seminars, Search
- [ ] ProjectDetail コンポーネント作成
- [ ] SeminarDetail コンポーネント作成
- [ ] ブラウザバック動作確認
- [ ] タブ遷移履歴の正確性確認
