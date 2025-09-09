import { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  schemeName: string;
  deadline: string;
  daysRemaining: number;
  type: 'deadline' | 'expired';
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        // Query saved schemes with deadlines
        const { data: savedSchemes } = await supabase
          .from('saved_schemes')
          .select(`
            scheme_id,
            schemes!inner(
              id,
              name,
              deadline
            )
          `)
          .eq('user_id', user.id);

        if (savedSchemes) {
          const now = new Date();
          const upcomingNotifications: Notification[] = [];

          savedSchemes.forEach((saved: any) => {
            const scheme = saved.schemes;
            if (scheme.deadline) {
              const deadlineDate = new Date(scheme.deadline);
              const diffTime = deadlineDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays <= 30 && diffDays >= 0) {
                upcomingNotifications.push({
                  id: scheme.id,
                  schemeName: scheme.name,
                  deadline: scheme.deadline,
                  daysRemaining: diffDays,
                  type: 'deadline'
                });
              } else if (diffDays < 0) {
                upcomingNotifications.push({
                  id: scheme.id,
                  schemeName: scheme.name,
                  deadline: scheme.deadline,
                  daysRemaining: Math.abs(diffDays),
                  type: 'expired'
                });
              }
            }
          });

          setNotifications(upcomingNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [user]);

  const unreadCount = notifications.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <CardDescription>
            {unreadCount === 0 
              ? 'No new notifications' 
              : `${unreadCount} deadline reminder${unreadCount > 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex-shrink-0">
                  {notification.type === 'deadline' ? (
                    <Clock className="h-5 w-5 text-orange-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{notification.schemeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {notification.type === 'deadline' 
                      ? `Deadline in ${notification.daysRemaining} day${notification.daysRemaining > 1 ? 's' : ''}`
                      : `Expired ${notification.daysRemaining} day${notification.daysRemaining > 1 ? 's' : ''} ago`
                    }
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </PopoverContent>
    </Popover>
  );
}