'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface NotificationData {
  newOrders: number;
  openMessages: number;
  unreadMessages: number;
}

export default function NotificationBell({ isAdmin }: { isAdmin: boolean }) {
  const [notifications, setNotifications] = useState<NotificationData>({
    newOrders: 0,
    openMessages: 0,
    unreadMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/summary');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalCount = isAdmin
    ? notifications.newOrders + notifications.openMessages
    : notifications.unreadMessages;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative'>
          <div className='relative'>
            <Bell className='h-5 w-5' />
            {totalCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full'
              >
                {totalCount > 9 ? '9+' : totalCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem>Loading...</DropdownMenuItem>
        ) : totalCount === 0 ? (
          <DropdownMenuItem>No new notifications</DropdownMenuItem>
        ) : (
          <>
            {isAdmin && notifications.newOrders > 0 && (
              <DropdownMenuItem asChild>
                <Link href='/admin/orders' className='cursor-pointer'>
                  <div className='flex items-center justify-between w-full'>
                    <span>New orders</span>
                    <Badge variant='secondary'>{notifications.newOrders}</Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {isAdmin && notifications.openMessages > 0 && (
              <DropdownMenuItem asChild>
                <Link href='/admin/messages' className='cursor-pointer'>
                  <div className='flex items-center justify-between w-full'>
                    <span>Open messages</span>
                    <Badge variant='secondary'>{notifications.openMessages}</Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
            {!isAdmin && notifications.unreadMessages > 0 && (
              <DropdownMenuItem asChild>
                <Link href='/user/profile/inbox' className='cursor-pointer'>
                  <div className='flex items-center justify-between w-full'>
                    <span>Unread messages</span>
                    <Badge variant='secondary'>{notifications.unreadMessages}</Badge>
                  </div>
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
