import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, FileText, Users, Briefcase, Vote, User, Wallet, Search, Bell, Settings, Shield, BookOpen, TrendingUp, Award } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Repository } from './components/Repository';
import { Seminars } from './components/Seminars';
import { Projects } from './components/Projects';
import { Governance } from './components/Governance';
import { Profile } from './components/Profile';
import { Search as SearchComponent } from './components/Search';
import { Settings as SettingsComponent } from './components/Settings';
import { Notifications } from './components/Notifications';
import { NotificationPopup } from './components/NotificationPopup';
import { ProfileSetup } from './components/ProfileSetup';
import { PaperDetail } from './components/PaperDetail';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Toaster } from './components/ui/sonner';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { useNotifications, type Notification as NotificationData, type ResearchPaper, getPapersFromStorage, calculateReputation, calculateVotingPower } from './hooks/useData';
import { useUserProfile } from './hooks/useUserProfile';

type TabType = 'dashboard' | 'repository' | 'seminars' | 'projects' | 'governance' | 'profile' | 'search' | 'settings' | 'notifications' | 'paperDetail';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [previousTab, setPreviousTab] = useState<TabType>('dashboard'); // 前のタブを記録
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isReputationInfoOpen, setIsReputationInfoOpen] = useState(false);
  const [userDID, setUserDID] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 論文データ更新トリガー
  const [reputation, setReputation] = useState(0); // レピュテーションスコア
  const [votingPower, setVotingPower] = useState(0); // DAO投票権
  
  // プロフィール初期化
  const { profile, isProfileCompleted, isLoading: profileLoading } = useUserProfile();

  // 初ログイン時プロフィール設定画面表示
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    // プロフィール読み込み完了後、未完成なら ProfileSetup を表示
    if (!profileLoading && !isProfileCompleted) {
      setShowProfileSetup(true);
    }
  }, [profileLoading, isProfileCompleted]);

  // 初期状態をブラウザ履歴に設定（マウント時に1回だけ）
  useEffect(() => {
    // ページ読み込み時に初期状態を replaceState（pushState ではなく）
    window.history.replaceState({ tab: 'dashboard', previousTab: 'dashboard' }, '', window.location.href);
  }, []);
  
  // レピュテーションと投票権を計算（refreshTrigger 変更時に再計算）
  useEffect(() => {
    const newReputation = calculateReputation();
    const newVotingPower = calculateVotingPower();
    setReputation(newReputation);
    setVotingPower(newVotingPower);
  }, [refreshTrigger]);
  
  // 実データから通知を取得
  const userId = userDID || 'demo-user';
  const { notifications: fetchedNotifications, loading: loadingNotifications } = useNotifications(userId);

  // メモ化：未読通知数を計算（fetchedNotifications が変わる時だけ再計算）
  const unreadCount = useMemo(() => {
    return fetchedNotifications.filter(n => !n.read).length;
  }, [fetchedNotifications]);

  // コールバック：通知を既読にする
  const markAsRead = useCallback((id: string) => {
    // NOTE: 実装時はバックエンドに通知
    console.log('Mark as read:', id);
  }, []);

  const deleteNotification = useCallback((id: string) => {
    // NOTE: 実装時はバックエンドから削除
    console.log('Delete notification:', id);
  }, []);

  const markAllAsRead = useCallback(() => {
    // NOTE: 実装時はバックエンドにすべて既読フラグを立てる
    console.log('Mark all as read');
  }, []);

  const deleteAllRead = useCallback(() => {
    // NOTE: 実装時はバックエンドから既読通知を削除
    console.log('Delete all read');
  }, []);

  // タブ切り替え時に履歴を記録する関数
  const handleTabChange = useCallback((newTab: TabType) => {
    if (newTab !== activeTab) {
      const prevTab = activeTab;
      setActiveTab(newTab);
      // ブラウザ履歴に状態を記録（新しいタブと前のタブ情報を含める）
      window.history.pushState({ tab: newTab, previousTab: prevTab }, '', window.location.href);
    }
  }, [activeTab]);

  // 論文詳細ページへナビゲート
  const navigateToPaperDetail = useCallback((paperId: string) => {
    const prevTab = activeTab;
    setSelectedPaperId(paperId);
    setActiveTab('paperDetail');
    // ブラウザ履歴に状態を記録
    window.history.pushState({ tab: 'paperDetail', paperId, previousTab: prevTab }, '', window.location.href);
  }, [activeTab]);

  // ブラウザバックをハンドル
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        // state がある場合はそれを使用
        setActiveTab(event.state.tab);
        if (event.state.paperId) {
          setSelectedPaperId(event.state.paperId);
        } else if (event.state.tab !== 'paperDetail') {
          setSelectedPaperId(null);
        }
        setPreviousTab(event.state.previousTab || 'dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 選択された論文データを取得（refreshTrigger で最新データに更新）
  const selectedPaper = selectedPaperId 
    ? getPapersFromStorage().find(p => p.id === selectedPaperId) 
    : null;

  const handleConnectWallet = () => {
    // Mock wallet connection
    setTimeout(() => {
      setIsWalletConnected(true);
      setUserDID('did:ethr:0x1234...5678');
    }, 1000);
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setUserDID('');
  };

  if (!isWalletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="mb-2">AcademiaChain</h1>
              <p className="text-gray-600">
                分散ID認証による学術研究プラットフォーム
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-blue-900 mb-1">学術レポジトリ</div>
                  <p className="text-blue-700 text-sm">
                    ブロックチェーンで研究成果を永続的に記録
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-purple-900 mb-1">ゼミ間交流</div>
                  <p className="text-purple-700 text-sm">
                    研究グループと共同研究を促進
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <Vote className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-indigo-900 mb-1">DAOガバナンス</div>
                  <p className="text-indigo-700 text-sm">
                    学術コミュニティの意思決定に参加
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleConnectWallet}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <Wallet className="w-5 h-5 mr-2" />
              ウォレットを接続
            </Button>

            <p className="text-center text-gray-500 text-sm mt-4">
              分散IDでセキュアに認証
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetup onComplete={() => setShowProfileSetup(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTabChange('dashboard')}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-900">AcademiaChain</span>
              </div>

              <div className="hidden md:flex relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="研究論文、ゼミ、プロジェクトを検索..."
                  className="pl-10 w-96"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleTabChange('search');
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Popover open={notificationPopupOpen} onOpenChange={setNotificationPopupOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0" 
                  align="end"
                  sideOffset={8}
                >
                  <NotificationPopup 
                    notifications={fetchedNotifications}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onViewAll={() => {
                      handleTabChange('notifications');
                      setNotificationPopupOpen(false);
                    }} 
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleTabChange('settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>

              <div 
                className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleTabChange('profile')}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-900">{profile?.name || '未設定'}</div>
                  <div className="text-xs text-gray-500">{profile?.university || '大学未選択'}</div>
                </div>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {profile?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDisconnectWallet}
              >
                切断
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>ダッシュボード</span>
            </button>

            <button
              onClick={() => handleTabChange('notifications')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="flex items-center justify-between flex-1">
                お知らせ
                {unreadCount > 0 && (
                  <Badge className="bg-red-600 text-white text-xs">{unreadCount}</Badge>
                )}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('search')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'search' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>検索</span>
            </button>

            <button
              onClick={() => handleTabChange('repository')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'repository' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>研究レポジトリ</span>
            </button>

            <button
              onClick={() => handleTabChange('seminars')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'seminars' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>ゼミ・研究室</span>
            </button>

            <button
              onClick={() => handleTabChange('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'projects' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>共同研究</span>
            </button>

            <button
              onClick={() => handleTabChange('governance')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'governance' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Vote className="w-5 h-5" />
              <span>ガバナンス</span>
            </button>

            <button
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              <span>プロフィール</span>
            </button>
          </nav>

          <div className="p-4 mt-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-8 h-8" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-white hover:text-blue-300 hover:bg-transparent transition-colors duration-200 px-2 py-1 border-2 border-gray-200 rounded"
                      onClick={() => setIsReputationInfoOpen(true)}
                    >
                      HOW TO GET
                    </Button>
                  </div>
                  <div className="text-sm">レピュテーション</div>
                </div>
              </div>
              <div className="text-2xl mb-2">{reputation.toLocaleString()}</div>
              <p className="text-blue-100 text-sm">
                研究貢献スコア
              </p>
            </div>
          </div>
        </aside>

        {/* Reputation Info Dialog */}
        <Dialog open={isReputationInfoOpen} onOpenChange={setIsReputationInfoOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                レピュテーション獲得方法
              </DialogTitle>
              <DialogDescription>
                研究活動を通じてレピュテーションスコアを獲得できます
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">📄 論文公開</div>
                <p className="text-xs text-gray-600 mb-2">1件あたり <span className="font-bold text-blue-600">100点</span></p>
                <p className="text-xs text-gray-500">論文を公開するたびにスコアが加算されます</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">👍 いいね獲得</div>
                <p className="text-xs text-gray-600 mb-2">1件あたり <span className="font-bold text-purple-600">5点</span></p>
                <p className="text-xs text-gray-500">論文が他のユーザーからいいねされます</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">💬 コメント獲得</div>
                <p className="text-xs text-gray-600 mb-2">1件あたり <span className="font-bold text-pink-600">10点</span></p>
                <p className="text-xs text-gray-500">論文へのコメントでスコアが増加します</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">🎓 セミナー開催</div>
                <p className="text-xs text-gray-600 mb-2">1件あたり <span className="font-bold text-green-600">50点</span></p>
                <p className="text-xs text-gray-500">セミナーやイベントを開催できます</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">🤝 プロジェクト参加</div>
                <p className="text-xs text-gray-600 mb-2">1件あたり <span className="font-bold text-orange-600">30点</span></p>
                <p className="text-xs text-gray-500">共同研究プロジェクトに参加できます</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <div className="text-sm font-semibold text-gray-900 mb-1">🏆 最大値</div>
                <p className="text-xs text-gray-600 mb-2">上限 <span className="font-bold text-indigo-600">10,000点</span></p>
                <p className="text-xs text-gray-500">レピュテーションは最大10,000点です</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <Dashboard 
              onNavigateToPaper={navigateToPaperDetail}
              onNavigateToRepository={() => setActiveTab('repository')}
            />
          )}
          {activeTab === 'repository' && <Repository onNavigateToPaper={navigateToPaperDetail} />}
          {activeTab === 'seminars' && <Seminars />}
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'governance' && <Governance votingPower={votingPower} />}
          {activeTab === 'search' && <SearchComponent initialQuery={searchQuery} onQueryChange={setSearchQuery} />}
          {activeTab === 'notifications' && (
            <Notifications 
              notifications={fetchedNotifications}
              onMarkAsRead={markAsRead}
              onDeleteNotification={deleteNotification}
              onMarkAllAsRead={markAllAsRead}
              onDeleteAllRead={deleteAllRead}
            />
          )}
          {activeTab === 'settings' && <SettingsComponent />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'paperDetail' && selectedPaper && (
            <PaperDetail 
              paper={selectedPaper}
              onBack={() => window.history.back()}
              onLike={(id) => {
                console.log('Liked:', id);
                // refreshTrigger を更新して selectedPaper を再取得
                setRefreshTrigger(prev => prev + 1);
              }}
              onDownload={(id) => {
                console.log('Downloaded:', id);
                // refreshTrigger を更新してダウンロード数を反映
                setRefreshTrigger(prev => prev + 1);
              }}
              onDelete={(id) => {
                console.log('Deleted:', id);
                // 削除後、自動的にバックして UI を更新
                window.history.back();
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          )}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
