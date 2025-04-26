import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../types';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Subscribe to real-time notifications for the current user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(newNotifications);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), {
            isRead: true
          })
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 