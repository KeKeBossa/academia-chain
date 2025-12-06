import { useState } from 'react';
import { Bell, Vote, FileText, Users, Briefcase, MessageSquare, Award, CheckCircle2, Calendar, ExternalLink, Trash2, MoreVertical, Filter } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

type NotificationType = 'proposal' | 'project' | 'paper' | 'seminar' | 'comment' | 'achievement' | 'system';

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

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteAllRead: () => void;
}

export function Notifications({ 
  notifications,
  onMarkAsRead,
  onDeleteNotification,
  onMarkAllAsRead,
  onDeleteAllRead
}: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'proposal':
        return <Vote className="w-5 h-5 text-purple-600" />;
      case 'project':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'paper':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'seminar':
        return <Users className="w-5 h-5 text-orange-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case 'proposal':
        return 'bg-purple-50';
      case 'project':
        return 'bg-blue-50';
      case 'paper':
        return 'bg-green-50';
      case 'seminar':
        return 'bg-orange-50';
      case 'comment':
        return 'bg-indigo-50';
      case 'achievement':
        return 'bg-yellow-50';
      case 'system':
        return 'bg-gray-50';
    }
  };



  const filteredNotifications = notifications.filter(notif =>
    filter === 'all' ? true : !notif.read
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">お知らせ</h1>
          <p className="text-gray-600">
            プラットフォーム内の活動やイベントの通知
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-blue-600 text-white">
              {unreadCount}件の未読
            </Badge>
          )}
        </div>
      </div>

      {/* Filter and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">
                  すべて ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  未読 ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onMarkAllAsRead();
                  toast.success('すべて既読にしました');
                }}
                disabled={unreadCount === 0}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                すべて既読
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onDeleteAllRead();
                  toast.success('既読の通知を削除しました');
                }}
                disabled={notifications.filter(n => n.read).length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                既読通知を削除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 mb-2">通知がありません</h3>
              <p className="text-sm text-gray-500">
                {filter === 'unread'
                  ? '未読の通知はありません'
                  : '新しい通知が届くとここに表示されます'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-600' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1 flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!notification.read && (
                            <DropdownMenuItem onClick={() => {
                              onMarkAsRead(notification.id);
                              toast.success('既読にしました');
                            }}>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              既読にする
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              onDeleteNotification(notification.id);
                              toast.success('通知を削除しました');
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Metadata */}
                    {notification.metadata && (
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        {notification.metadata.proposalId && (
                          <span className="font-mono">{notification.metadata.proposalId}</span>
                        )}
                        {notification.metadata.projectName && (
                          <span>{notification.metadata.projectName}</span>
                        )}
                        {notification.metadata.userName && (
                          <span>by {notification.metadata.userName}</span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {notification.timestamp}
                      </div>

                      {notification.actionLabel && (
                        <Button variant="outline" size="sm">
                          {notification.actionLabel}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Card */}
      {notifications.length > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl text-blue-900 mb-1">
                  {notifications.filter(n => n.type === 'proposal').length}
                </div>
                <div className="text-xs text-blue-700">DAO提案</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-blue-900 mb-1">
                  {notifications.filter(n => n.type === 'project').length}
                </div>
                <div className="text-xs text-blue-700">プロジェクト</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-blue-900 mb-1">
                  {notifications.filter(n => n.type === 'paper').length}
                </div>
                <div className="text-xs text-blue-700">論文</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-blue-900 mb-1">
                  {unreadCount}
                </div>
                <div className="text-xs text-blue-700">未読</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
