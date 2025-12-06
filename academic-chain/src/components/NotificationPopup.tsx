import { Bell, Vote, FileText, Users, Briefcase, MessageSquare, Award, CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { type Notification } from '../hooks/useData';

type NotificationType = Notification['type'];

interface NotificationPopupProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}

export function NotificationPopup({ notifications, onMarkAsRead, onMarkAllAsRead, onViewAll }: NotificationPopupProps) {

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'proposal':
        return <Vote className="w-4 h-4 text-purple-600" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'paper':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'seminar':
        return <Users className="w-4 h-4 text-orange-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-600" />;
      case 'system':
        return <Bell className="w-4 h-4 text-gray-600" />;
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-[400px] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-900">お知らせ</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          すべて見る
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">通知がありません</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.read) {
                    onMarkAsRead(notification.id);
                  }
                }}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.read && (
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        )}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            すべて既読にする
          </Button>
        </div>
      )}
    </div>
  );
}
