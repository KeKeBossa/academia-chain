import { useState, useCallback, useMemo } from 'react';
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
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Toaster } from './components/ui/sonner';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { useNotifications, type Notification as NotificationData } from './hooks/useData';

type TabType = 'dashboard' | 'repository' | 'seminars' | 'projects' | 'governance' | 'profile' | 'search' | 'settings' | 'notifications';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userDID, setUserDID] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveTab('dashboard')}
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
                      setActiveTab('search');
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
                      setActiveTab('notifications');
                      setNotificationPopupOpen(false);
                    }} 
                  />
                </PopoverContent>
              </Popover>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="w-5 h-5" />
              </Button>

              <div 
                className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setActiveTab('profile')}
              >
                <div className="text-right hidden sm:block">
                  <div className="text-sm text-gray-900">田中 太郎</div>
                  <div className="text-xs text-gray-500">{userDID}</div>
                </div>
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">田中</AvatarFallback>
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
              onClick={() => setActiveTab('dashboard')}
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
              onClick={() => setActiveTab('notifications')}
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
              onClick={() => setActiveTab('search')}
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
              onClick={() => setActiveTab('repository')}
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
              onClick={() => setActiveTab('seminars')}
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
              onClick={() => setActiveTab('projects')}
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
              onClick={() => setActiveTab('governance')}
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
              onClick={() => setActiveTab('profile')}
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
              <Award className="w-8 h-8 mb-2" />
              <div className="mb-1">レピュテーション</div>
              <div className="text-2xl mb-2">1,247</div>
              <p className="text-blue-100 text-sm">
                研究貢献スコア
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'repository' && <Repository />}
          {activeTab === 'seminars' && <Seminars />}
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'governance' && <Governance />}
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
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
