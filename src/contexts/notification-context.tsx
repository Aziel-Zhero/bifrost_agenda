
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { AppNotification } from '@/types';

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'timestamp'> & { timestamp?: Date }) => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((notification: Omit<AppNotification, 'timestamp'> & { timestamp?: Date }) => {
    const newNotification: AppNotification = {
      ...notification,
      timestamp: notification.timestamp || new Date(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20 notifications
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
