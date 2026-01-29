import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showSuccess: (message: string, title?: string, action?: Notification['action']) => void;
  showError: (message: string, title?: string, action?: Notification['action']) => void;
  showWarning: (message: string, title?: string, action?: Notification['action']) => void;
  showInfo: (message: string, title?: string, action?: Notification['action']) => void;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const showSuccess = useCallback((message: string, title: string = 'Success', action?: Notification['action']) => {
    const notification = addNotification({ type: 'success', title, message, action });
    toast({
      title,
      description: message,
      variant: 'default',
      action: action ? <button onClick={action.onClick}>{action.label}</button> : undefined,
    });
  }, [toast, addNotification]);

  const showError = useCallback((message: string, title: string = 'Error', action?: Notification['action']) => {
    const notification = addNotification({ type: 'error', title, message, action });
    toast({
      title,
      description: message,
      variant: 'destructive',
      action: action ? <button onClick={action.onClick}>{action.label}</button> : undefined,
    });
  }, [toast, addNotification]);

  const showWarning = useCallback((message: string, title: string = 'Warning', action?: Notification['action']) => {
    const notification = addNotification({ type: 'warning', title, message, action });
    toast({
      title,
      description: message,
      variant: 'default',
      action: action ? <button onClick={action.onClick}>{action.label}</button> : undefined,
    });
  }, [toast, addNotification]);

  const showInfo = useCallback((message: string, title: string = 'Info', action?: Notification['action']) => {
    const notification = addNotification({ type: 'info', title, message, action });
    toast({
      title,
      description: message,
      variant: 'default',
      action: action ? <button onClick={action.onClick}>{action.label}</button> : undefined,
    });
  }, [toast, addNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifications,
    markAsRead,
    clearNotification,
    clearAllNotifications,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}