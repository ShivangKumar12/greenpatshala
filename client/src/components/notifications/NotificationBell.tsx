// client/src/components/notifications/NotificationBell.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, X, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// todo: remove mock functionality
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Course Enrollment',
    message: 'You have been enrolled in "Complete UPSC CSE Preparation"',
    type: 'success',
    timestamp: '5 minutes ago',
    read: false,
    actionUrl: '/dashboard',
  },
  {
    id: '2',
    title: 'Quiz Reminder',
    message: 'Weekly Current Affairs Quiz starts in 1 hour',
    type: 'warning',
    timestamp: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    title: 'Certificate Available',
    message: 'Your certificate for Banking PO course is ready to download',
    type: 'info',
    timestamp: '2 hours ago',
    read: true,
  },
];

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-muted/80 transition-colors duration-300 h-9 w-9"
          data-testid="button-notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full p-0 flex items-center justify-center text-[10px] font-bold border-2 border-background shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto p-1"
                  onClick={handleMarkAllAsRead}
                  data-testid="button-mark-all-read"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1"
                onClick={handleClearAll}
                data-testid="button-clear-all"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            {notifications.map((notification) => (
              <div key={notification.id}>
                <div
                  className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                    }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notification.read ? 'bg-primary' : 'bg-transparent'
                      }`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Badge variant="outline" className={`text-xs shrink-0 ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-1"
                              onClick={() => handleMarkAsRead(notification.id)}
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-destructive"
                            onClick={() => handleDelete(notification.id)}
                            data-testid={`button-delete-${notification.id}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </div>
            ))}
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary cursor-pointer" data-testid="link-view-all">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
