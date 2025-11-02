'use client';

import { useState, type ComponentType } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Hash,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Upload,
  User,
  UserPlus,
  Users,
  Vote,
  Wallet
} from 'lucide-react';

type Tab = 'dashboard' | 'repository' | 'seminars' | 'projects' | 'governance' | 'profile';

const tabs: Array<{
  id: Tab;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'ダッシュボード', description: 'コミュニティの概要', icon: Home },
  { id: 'repository', label: '研究レポジトリ', description: '論文とIPFSログ', icon: FileText },
  { id: 'seminars', label: 'ゼミ・研究室', description: '参加ラボの状況', icon: Users },
  { id: 'projects', label: '共同研究', description: '進行中の案件', icon: Briefcase },
  { id: 'governance', label: 'DAOガバナンス', description: '提案と投票', icon: Vote },
  { id: 'profile', label: 'プロフィール', description: 'DIDと実績', icon: User }
];

const dashboardStats = [
  {
    label: '公開論文',
    value: '12',
    change: '+2 今月',
    accent: 'bg-blue-50 text-blue-600',
    icon: FileText
  },
  {
    label: '参加ゼミ',
    value: '3',
    change: '+1 今学期',
    accent: 'bg-purple-50 text-purple-600',
    icon: Users
  },
  {
    label: '共同研究',
    value: '5',
    change: '2 進行中',
    accent: 'bg-emerald-50 text-emerald-600',
    icon: Briefcase
  },
  {
    label: 'DAOトークン',
    value: '850',
    change: '+50 今週',
    accent: 'bg-amber-50 text-amber-600',
    icon: TrendingUp
  }
];

const recentPapers = [
  {
    title: '量子コンピューティングにおける誤り訂正の新手法',
    author: '山田 花子',
    affiliation: '東京大学',
    date: '2日前',
    tags: ['量子計算', '誤り訂正'],
    likes: 24,
    comments: 8
  },
  {
    title: '機械学習を用いた気候変動予測モデルの改善',
    author: '佐藤 健',
    affiliation: '京都大学',
    date: '3日前',
    tags: ['機械学習', '気候科学'],
    likes: 42,
    comments: 15
  },
  {
    title: 'ブロックチェーン技術の社会実装に関する考察',
    author: '鈴木 美咲',
    affiliation: '慶應義塾大学',
    date: '5日前',
    tags: ['ブロックチェーン', '社会実装'],
    likes: 31,
    comments: 12
  }
];

const upcomingEvents = [
  {
    title: '学際的研究発表会',
    date: '2025年10月25日',
    time: '14:00 - 17:00',
    participants: 45
  },
  {
    title: 'AI倫理に関するワークショップ',
    date: '2025年10月28日',
    time: '10:00 - 12:00',
    participants: 28
  },
  {
    title: '共同研究マッチングイベント',
    date: '2025年11月2日',
    time: '15:00 - 18:00',
    participants: 67
  }
];

const repositoryEntries = [
  {
    title: '深層学習を用いた医療画像診断の高精度化',
    author: '山田 花子',
    university: '東京大学',
    date: '2025-10-20',
    tags: ['深層学習', '医療AI', 'CNN'],
    txHash: '0xabcd...1234',
    ipfsHash: 'QmX7Y8Z9...',
    downloads: 156,
    citations: 8
  },
  {
    title: '再生可能エネルギーの効率的な蓄電システムの開発',
    author: '佐藤 健',
    university: '京都大学',
    date: '2025-10-18',
    tags: ['再生エネ', '蓄電技術'],
    txHash: '0xefgh...5678',
    ipfsHash: 'QmA1B2C3...',
    downloads: 234,
    citations: 15
  },
  {
    title: 'ブロックチェーンベースの査読システム設計',
    author: '鈴木 美咲',
    university: '慶應義塾大学',
    date: '2025-10-15',
    tags: ['ブロックチェーン', '査読', 'DID'],
    txHash: '0xijkl...9012',
    ipfsHash: 'QmD4E5F6...',
    downloads: 98,
    citations: 5
  }
];

const seminars = [
  {
    name: '量子コンピューティング研究会',
    university: '東京大学',
    professor: '山田 太郎 教授',
    members: 24,
    field: '量子情報科学',
    tags: ['量子計算', '量子アルゴリズム'],
    projects: 5,
    publications: 18,
    open: true
  },
  {
    name: '機械学習とデータサイエンス',
    university: '京都大学',
    professor: '佐藤 花子 教授',
    members: 32,
    field: '情報学',
    tags: ['深層学習', '強化学習'],
    projects: 8,
    publications: 25,
    open: true
  },
  {
    name: 'サステナブルエネルギー工学',
    university: '早稲田大学',
    professor: '鈴木 健 教授',
    members: 18,
    field: 'エネルギー工学',
    tags: ['太陽光', '蓄電池'],
    projects: 4,
    publications: 12,
    open: false
  }
];

const projectCards = [
  {
    title: 'AIを活用した気候変動予測モデル',
    description: '機械学習で気候変動予測を高精度化する共同研究。',
    status: '進行中',
    progress: 65,
    universities: ['東大', '京大', '早稲田'],
    meetings: 8,
    papers: 3
  },
  {
    title: '量子暗号通信の実用化研究',
    description: '長距離通信を可能にするQKDの改良プロジェクト。',
    status: '進行中',
    progress: 42,
    universities: ['阪大', '東工大'],
    meetings: 4,
    papers: 1
  },
  {
    title: 'ブロックチェーン基盤の出版プラットフォーム',
    description: '透明な査読を目指す分散型出版システム。',
    status: '計画中',
    progress: 15,
    universities: ['慶應', '東大'],
    meetings: 2,
    papers: 0
  }
];

const governanceProposals = [
  {
    title: '新しい研究分野カテゴリの追加',
    proposer: '山田 花子',
    status: 'active',
    votesFor: 247,
    votesAgainst: 38,
    quorum: 300,
    deadline: '2025-10-25'
  },
  {
    title: '共同研究助成金の配分基準変更',
    proposer: '佐藤 健',
    status: 'active',
    votesFor: 189,
    votesAgainst: 145,
    quorum: 300,
    deadline: '2025-10-28'
  },
  {
    title: '査読システムの透明性向上',
    proposer: '鈴木 美咲',
    status: 'pending',
    votesFor: 0,
    votesAgainst: 0,
    quorum: 300,
    deadline: '2025-11-05'
  }
];

const userProfile = {
  name: '田中 太郎',
  did: 'did:ethr:0x1234...5678',
  email: 'tanaka@example.ac.jp',
  university: '東京大学',
  department: '情報理工学系研究科',
  position: '博士課程3年',
  bio: '量子計算と機械学習を専門に、DIDとDAOを活用した研究連携に取り組んでいます。',
  reputation: 1247,
  papers: 12,
  seminars: 3,
  projects: 5,
  daoTokens: 850
};

const achievements = [
  { title: '初論文公開', date: '2024-05-10' },
  { title: '共同研究開始', date: '2024-06-20' },
  { title: 'DAOトークン500達成', date: '2025-07-01' }
];

const skillMatrix = [
  { name: '量子アルゴリズム', level: 85 },
  { name: '機械学習', level: 90 },
  { name: 'Python', level: 95 },
  { name: 'Qiskit', level: 80 },
  { name: 'ブロックチェーン', level: 70 }
];

export default function AcademicChainPreview() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsWalletConnected(true);
      setIsConnecting(false);
    }, 600);
  };

  const handleDisconnect = () => {
    setIsWalletConnected(false);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
          Academic Chain UI
        </p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-3xl font-semibold text-slate-50">
            Wallet で開くダッシュボード体験を Next.js ランディングに統合
          </h2>
          <p className="text-sm text-slate-400 lg:max-w-md">
            Vite で試作した「AcademiaChain」フロントを Tailwind + RainbowKit 構成に移植し、
            ランディング上で即座に UI をプレビューできるようにしました。
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-2xl shadow-indigo-950/40">
        {isWalletConnected ? (
          <div className="space-y-6">
            <header className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-100">AcademiaChain</p>
                    <p className="text-xs text-slate-400">did:ethr:0x1234...5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl border border-transparent bg-slate-800/60 p-2 text-slate-300 transition hover:text-white"
                    aria-label="通知"
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-transparent bg-slate-800/60 p-2 text-slate-300 transition hover:text-white"
                    aria-label="設定"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    田中
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    className="w-full rounded-2xl border border-slate-800/60 bg-slate-950/40 py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                    placeholder="研究論文、ゼミ、プロジェクトを検索..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-red-400/70 hover:text-red-200"
                >
                  <Wallet className="h-4 w-4" />
                  切断する
                </button>
              </div>
            </header>

            <div className="flex flex-col gap-6 lg:flex-row">
              <aside className="flex w-full flex-row overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 lg:w-64 lg:flex-col">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex min-w-[180px] flex-1 flex-col gap-1 rounded-2xl px-4 py-3 text-left transition lg:min-w-0 ${
                        isActive
                          ? 'border border-indigo-400/40 bg-indigo-500/20 text-indigo-100'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </span>
                      <span className="text-xs text-slate-400">{tab.description}</span>
                    </button>
                  );
                })}
              </aside>
              <div className="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
                {activeTab === 'dashboard' && <DashboardPanel />}
                {activeTab === 'repository' && <RepositoryPanel />}
                {activeTab === 'seminars' && <SeminarsPanel />}
                {activeTab === 'projects' && <ProjectsPanel />}
                {activeTab === 'governance' && <GovernancePanel />}
                {activeTab === 'profile' && <ProfilePanel />}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                Academic Wallet Onboarding
              </div>
              <h3 className="text-3xl font-semibold text-slate-50">
                分散 ID 認証パネルを Academic Repository のランディングにネイティブ統合
              </h3>
              <p className="text-sm leading-7 text-slate-300">
                Wallet 接続前の教育用ヒーロー、認証後のダッシュボード、DAO ガバナンスビューまでを 1
                つのセクションにまとめ、UI の一貫性とコンテンツ密度を最適化しました。
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FeatureCallout
                  icon={BookOpen}
                  title="研究資産"
                  description="IPFS と DAO レビューフローを即座に体験"
                />
                <FeatureCallout
                  icon={Users}
                  title="ゼミ連携"
                  description="参加研究室・共同研究の状態をライブ表示"
                />
                <FeatureCallout
                  icon={Vote}
                  title="DAO 投票"
                  description="提案の投票率とクォーラム進捗を可視化"
                />
                <FeatureCallout
                  icon={Award}
                  title="DID 実績"
                  description="プロフィール、スキル、レピュテーションを集約"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/60 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-slate-50">AcademiaChain Preview</p>
                <p className="mt-2 text-sm text-slate-300">
                  分散 ID 認証による学術研究プラットフォーム
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <ChecklistItem text="ウォレット署名 & DID チャレンジ" />
                <ChecklistItem text="研究レポジトリと IPFS CID" />
                <ChecklistItem text="共同研究・ゼミのライブ統計" />
                <ChecklistItem text="DAO 投票とレピュテーション" />
              </div>
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isConnecting ? '接続中…' : 'ウォレットを接続'}
                <Wallet className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">
                分散 ID でセキュアに認証（デモ環境）
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="space-y-6 text-slate-100">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-slate-50">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold text-emerald-300">{stat.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/30 p-5">
          <p className="text-sm font-semibold text-slate-200">最新の研究論文</p>
          {recentPapers.map((paper) => (
            <div
              key={paper.title}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{paper.title}</p>
                  <p className="text-xs text-slate-400">
                    {paper.author} ・ {paper.affiliation} ・ {paper.date}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs text-emerald-200">
                  検証済
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                {paper.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-700/80 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {paper.likes}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {paper.comments}
                </span>
                <button className="ml-auto inline-flex items-center gap-1 text-indigo-200">
                  詳細を見る
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-5">
          <p className="text-sm font-semibold text-slate-200">今後のイベント</p>
          <div className="mt-4 space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.title}
                className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4"
              >
                <span className="text-xs text-slate-400">{event.date}</span>
                <p className="mt-1 text-base font-semibold text-white">{event.title}</p>
                <p className="text-xs text-slate-400">{event.time}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {event.participants}名参加予定
                  </span>
                  <button className="rounded-full border border-slate-700/70 px-3 py-1 text-emerald-200">
                    参加
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RepositoryPanel() {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">研究レポジトリ</p>
          <p className="text-xs text-slate-400">ブロックチェーンで永続化した論文を参照</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white">
          <Upload className="h-3.5 w-3.5" />
          論文を公開
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full rounded-2xl border border-slate-800/60 bg-slate-950/40 py-2.5 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
            placeholder="論文タイトル、著者、キーワードで検索..."
          />
        </div>
      </div>

      <div className="space-y-4">
        {repositoryEntries.map((paper) => (
          <div
            key={paper.title}
            className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-white">{paper.title}</p>
              <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[11px] text-emerald-200">
                検証済
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {paper.author} ・ {paper.university} ・ {paper.date}
            </p>
            <p className="mt-3 text-xs text-slate-400">IPFS: {paper.ipfsHash}</p>
            <p className="text-xs text-slate-400">Tx: {paper.txHash}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
              {paper.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700/80 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {paper.citations} 引用
              </span>
              <span className="inline-flex items-center gap-1">
                <DownloadIcon />
                {paper.downloads} ダウンロード
              </span>
              <button className="ml-auto inline-flex items-center gap-1 text-indigo-200">
                詳細
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeminarsPanel() {
  return (
    <div className="space-y-4 text-slate-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">ゼミ・研究室</p>
          <p className="text-xs text-slate-400">全国の大学と共同研究をマッチング</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white">
          <UserPlus className="h-3.5 w-3.5" />
          研究室を登録
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {seminars.map((lab) => (
          <div
            key={lab.name}
            className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold text-white">{lab.name}</p>
                <p className="text-xs text-slate-400">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  {lab.university} ・ {lab.professor}
                </p>
              </div>
              {lab.open && (
                <span className="rounded-full border border-green-400/40 px-3 py-1 text-[11px] text-emerald-200">
                  募集中
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-400">領域: {lab.field}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
              {lab.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700/80 px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-3 text-center text-xs text-slate-300">
              <div>
                <p className="text-sm font-semibold text-white">{lab.members}</p>
                <p>メンバー</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{lab.projects}</p>
                <p>進行プロジェクト</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{lab.publications}</p>
                <p>論文</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{lab.open ? 'Yes' : 'No'}</p>
                <p>共同研究</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsPanel() {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">共同研究プロジェクト</p>
          <p className="text-xs text-slate-400">大学の枠を超えた取り組み</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white">
          <Plus className="h-3.5 w-3.5" />
          新規プロジェクト
        </button>
      </div>

      <div className="space-y-4">
        {projectCards.map((project) => (
          <div
            key={project.title}
            className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-white">{project.title}</p>
              <span className="rounded-full border border-blue-400/40 px-3 py-1 text-[11px] text-blue-200">
                {project.status}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">{project.description}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {project.universities.join(' / ')}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                MTG {project.meetings} 回
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                論文 {project.papers}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GovernancePanel() {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base font-semibold text-white">DAO ガバナンス</p>
          <p className="text-xs text-slate-400">投票権を使って意思決定</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white">
          <Vote className="h-3.5 w-3.5" />
          新規提案
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/60 bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
          <p className="text-sm font-semibold text-white">あなたの投票権</p>
          <p className="mt-1 text-3xl font-semibold text-white">850</p>
          <p className="text-xs text-indigo-100">今月 +50</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4">
          <p className="text-sm font-semibold text-slate-200">アクティビティ</p>
          <div className="mt-3 space-y-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-2 text-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> 12 件の投票に参加
            </p>
            <p className="inline-flex items-center gap-2 text-blue-200">
              <Plus className="h-4 w-4" /> 8 件の提案を提出
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {governanceProposals.map((proposal) => {
          const totalVotes = proposal.votesFor + proposal.votesAgainst;
          const progress = Math.min(100, Math.round((totalVotes / proposal.quorum) * 100));
          const statusColor =
            proposal.status === 'active'
              ? 'text-blue-200'
              : proposal.status === 'pending'
                ? 'text-slate-300'
                : 'text-emerald-200';
          const StatusIcon =
            proposal.status === 'pending'
              ? Clock
              : proposal.status === 'active'
                ? Vote
                : CheckCircle2;
          return (
            <div
              key={proposal.title}
              className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-white">{proposal.title}</p>
                <span className={`inline-flex items-center gap-1 text-[11px] ${statusColor}`}>
                  <StatusIcon className="h-3.5 w-3.5" />
                  {proposal.status === 'active'
                    ? '投票中'
                    : proposal.status === 'pending'
                      ? '開始前'
                      : '完了'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                提案者: {proposal.proposer} ・ 締切 {proposal.deadline}
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-200">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {proposal.votesFor} 賛成
                </span>
                <span className="inline-flex items-center gap-1 text-rose-200">
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {proposal.votesAgainst} 反対
                </span>
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  クォーラム {proposal.quorum}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfilePanel() {
  return (
    <div className="space-y-5 text-slate-100">
      <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-5">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-semibold text-white">
            田中
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-xl font-semibold text-white">{userProfile.name}</p>
            <p className="text-sm text-slate-300">
              {userProfile.university} / {userProfile.department} / {userProfile.position}
            </p>
            <p className="text-xs text-slate-400">{userProfile.email}</p>
            <p className="text-xs text-indigo-200">{userProfile.bio}</p>
          </div>
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs">
            <p className="text-slate-400">分散ID</p>
            <p className="font-mono text-slate-100">{userProfile.did}</p>
            <button className="mt-3 inline-flex items-center gap-1 text-indigo-200">
              ブロックエクスプローラ
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ProfileStat
          label="レピュテーション"
          value={userProfile.reputation}
          icon={Award}
          color="text-amber-300"
        />
        <ProfileStat
          label="公開論文"
          value={userProfile.papers}
          icon={FileText}
          color="text-blue-300"
        />
        <ProfileStat
          label="共同研究"
          value={userProfile.projects}
          icon={Briefcase}
          color="text-emerald-300"
        />
        <ProfileStat
          label="参加ゼミ"
          value={userProfile.seminars}
          icon={Users}
          color="text-purple-300"
        />
        <ProfileStat
          label="DAOトークン"
          value={userProfile.daoTokens}
          icon={Hash}
          color="text-indigo-300"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4">
          <p className="text-sm font-semibold text-white">最近の実績</p>
          <div className="mt-3 space-y-3 text-xs text-slate-300">
            {achievements.map((achievement) => (
              <div
                key={achievement.title}
                className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/40 px-3 py-2"
              >
                <span>{achievement.title}</span>
                <span className="text-slate-500">{achievement.date}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4">
          <p className="text-sm font-semibold text-white">スキルセット</p>
          <div className="mt-3 space-y-3">
            {skillMatrix.map((skill) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{skill.name}</span>
                  <span>{skill.level}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCallout({
  icon: Icon,
  title,
  description
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 text-indigo-200">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-slate-100">{title}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200/10 bg-white/5 px-3 py-2 text-sm text-slate-100">
      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
      {text}
    </div>
  );
}

function ProfileStat({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-950/30 p-4 text-center">
      <Icon className={`mx-auto mb-2 h-6 w-6 ${color}`} />
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}
