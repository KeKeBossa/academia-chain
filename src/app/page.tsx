'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  FileText,
  Users,
  Briefcase,
  Vote,
  User,
  Wallet,
  Search as SearchIcon,
  Bell,
  Settings as SettingsIcon,
  Shield,
  BookOpen,
  TrendingUp,
  Award
} from 'lucide-react';

import { Dashboard } from './components/academia/Dashboard';
import { Repository } from './components/academia/Repository';
import { Seminars } from './components/academia/Seminars';
import { Projects } from './components/academia/Projects';
import { Governance } from './components/academia/Governance';
import { Profile } from './components/academia/Profile';
import { Notifications as NotificationsPanel } from './components/academia/Notifications';
import { NotificationPopup } from './components/academia/NotificationPopup';
import { Search as SearchPanel } from './components/academia/Search';
import { Settings as SettingsPanel } from './components/academia/Settings';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { Toaster } from './components/ui/sonner';
import { cn } from './components/ui/utils';
import { fetchNotifications } from '@/lib/dashboard/api';

type TabType =
  | 'dashboard'
  | 'repository'
  | 'seminars'
  | 'projects'
  | 'governance'
  | 'profile'
  | 'search'
  | 'notifications'
  | 'settings';

type NotificationType =
  | 'proposal'
  | 'project'
  | 'paper'
  | 'seminar'
  | 'comment'
  | 'achievement'
  | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    proposalId?: string;
    projectName?: string;
    paperTitle?: string;
    userName?: string;
  };
}

const navItems: { value: TabType; label: string; icon: LucideIcon }[] = [
  { value: 'dashboard', label: 'ダッシュボード', icon: Home },
  { value: 'notifications', label: 'お知らせ', icon: Bell },
  { value: 'search', label: '検索', icon: SearchIcon },
  { value: 'repository', label: '研究レポジトリ', icon: FileText },
  { value: 'seminars', label: 'ゼミ・研究室', icon: Users },
  { value: 'projects', label: '共同研究', icon: Briefcase },
  { value: 'governance', label: 'ガバナンス', icon: Vote },
  { value: 'profile', label: 'プロフィール', icon: User }
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [userDID, setUserDID] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPopupOpen, setNotificationPopupOpen] = useState(false);
  
  // 通知データをクエリで取得
  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // APIから取得した通知データで初期化
  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
    }
  }, [notificationsData]);

  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    setIsWalletConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (!address) {
      setUserDID('');
      return;
    }

    const trimmed = `${address.slice(0, 6)}...${address.slice(-4)}`;
    setUserDID(`did:ethr:${trimmed}`);
  }, [address, chainId]);

  const displayAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };

  const deleteAllRead = () => {
    setNotifications((prev) => prev.filter((notification) => !notification.read));
  };

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setIsWalletConnected(false);
    setUserDID('');
  };

  if (!isWalletConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-2 type-stat-md text-gray-900">AcademiaChain</h1>
              <p className="text-gray-600">分散ID認証による学術研究プラットフォーム</p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div>
                  <div className="mb-1 text-blue-900">学術レポジトリ</div>
                  <p className="type-small text-blue-700">
                    ブロックチェーンで研究成果を永続的に記録
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4">
                <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                <div>
                  <div className="mb-1 text-purple-900">ゼミ間交流</div>
                  <p className="type-small text-purple-700">研究グループと共同研究を促進</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                <Vote className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                <div>
                  <div className="mb-1 text-indigo-900">DAOガバナンス</div>
                  <p className="type-small text-indigo-700">学術コミュニティの意思決定に参加</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleConnectWallet}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              ウォレットを接続
            </Button>

            <p className="mt-4 text-center type-small text-gray-500">分散IDでセキュアに認証</p>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'repository':
        return <Repository />;
      case 'seminars':
        return <Seminars />;
      case 'projects':
        return <Projects />;
      case 'governance':
        return <Governance />;
      case 'profile':
        return <Profile />;
      case 'search':
        return <SearchPanel initialQuery={searchQuery} onQueryChange={setSearchQuery} />;
      case 'notifications':
        return (
          <NotificationsPanel
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onDeleteNotification={deleteNotification}
            onMarkAllAsRead={markAllAsRead}
            onDeleteAllRead={deleteAllRead}
          />
        );
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div
              className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-900">AcademiaChain</span>
            </div>
            <div className="relative hidden md:flex">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="研究論文、ゼミ、プロジェクトを検索..."
                className="w-96 pl-10"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && searchQuery.trim()) {
                    setActiveTab('search');
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Popover open={notificationPopupOpen} onOpenChange={setNotificationPopupOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
                <NotificationPopup
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onViewAll={() => {
                    setActiveTab('notifications');
                    setNotificationPopupOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" onClick={() => setActiveTab('settings')}>
              <SettingsIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="hidden text-right sm:block">
                <div className="type-small text-gray-900">{displayAddress || '接続中'}</div>
                <div className="type-xs text-gray-500">{userDID}</div>
              </div>
              <Avatar>
                <AvatarImage alt="wallet avatar" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  {displayAddress ? displayAddress.slice(2, 4) : 'ID'}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnectWallet}>
              切断
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-16 hidden min-h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white lg:block">
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const showUnread = item.value === 'notifications' && unreadCount > 0;
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                    activeTab === item.value
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex flex-1 items-center justify-between">
                    {item.label}
                    {showUnread && <Badge className="bg-red-600 text-white">{unreadCount}</Badge>}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="p-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white">
              <Award className="mb-2 h-8 w-8" />
              <div className="mb-1">レピュテーション</div>
              <div className="mb-2 type-stat-md">1,247</div>
              <p className="type-small text-blue-100">研究貢献スコア</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6">{renderTabContent()}</main>
      </div>
      <Toaster />
    </div>
  );
}
