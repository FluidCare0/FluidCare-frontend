import React, { useState, useEffect, useCallback } from 'react';
import notificationApi from '../api/notificationApi';
import { sensorWebSocket } from '../api/websocket';
import WebSocketStatus from './WebSocketStatus';
import { toast } from 'react-toastify';

// Module-level set — survives React StrictMode's intentional component
// remount so we never fire a toast twice for the same notification id.
const handledToastIds = new Set();

const NotificationSidebar = ({ isMobileOpen, onCloseMobile }) => {
  const [notifications, setNotifications] = useState([]);
  const [newNotificationIds, setNewNotificationIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ── WebSocket handler ──────────────────────────────────────────────────
  const handleNewNotification = useCallback((data) => {
    console.log('🔔 New notification received via WS:', data);
    const newNotif = data.notification;
    if (!newNotif || !newNotif.id) return;

    // Prepend to list, removing any stale duplicate by id
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== newNotif.id);
      return [newNotif, ...filtered].slice(0, 50);
    });

    // Highlight animation for 3 s
    setNewNotificationIds(prev => new Set([...prev, newNotif.id]));
    setTimeout(() => {
      setNewNotificationIds(prev => {
        const next = new Set(prev);
        next.delete(newNotif.id);
        return next;
      });
    }, 3000);

    // Toast — module-level set prevents double-fire on StrictMode remount.
    // React-Toastify's toastId is a second layer of defence.
    const toastKey = `notification-${newNotif.id}`;
    if (handledToastIds.has(toastKey)) return;
    handledToastIds.add(toastKey);

    if (newNotif.severity === 'high') {
      toast.error(`${newNotif.title}: ${newNotif.message}`, {
        toastId: toastKey,
        autoClose: false,
      });
    } else if (newNotif.severity === 'med') {
      toast.warning(`${newNotif.title}: ${newNotif.message}`, {
        toastId: toastKey,
      });
    } else {
      toast.info(newNotif.title, {
        toastId: toastKey,
      });
    }
  }, []);

  useEffect(() => {
    sensorWebSocket.on('new_notification', handleNewNotification);
    return () => {
      sensorWebSocket.off('new_notification', handleNewNotification);
    };
  }, [handleNewNotification]);

  // ── Actions ────────────────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleResolve = async (id) => {
    try {
      await notificationApi.resolveNotification(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_resolved: true, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to resolve:', error);
      toast.error('Failed to resolve notification');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getSeverityBgColor = (severity) => {
    if (severity === 'high') return 'bg-red-50 border-l-4 border-red-500';
    if (severity === 'med') return 'bg-yellow-50 border-l-4 border-yellow-500';
    return 'bg-white';
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return '--';
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 xl:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <div
        className={`
                    fixed inset-y-0 right-0 z-40 transform xl:relative xl:translate-x-0
                    flex h-screen w-full max-w-[380px] flex-col
                    border-l border-gray-200 bg-white shadow-2xl xl:w-80 xl:shadow-sm
                    transition-transform duration-300 ease-in-out
                    ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center gap-2">
                <WebSocketStatus label="Sync" />
                <button
                  onClick={onCloseMobile}
                  className="xl:hidden p-1 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 italic">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => {
                const isNew = newNotificationIds.has(notification.id);
                const isHighAndUnresolved =
                  notification.severity === 'high' && !notification.is_resolved;

                return (
                  <div
                    key={notification.id}
                    className={`
                                            p-4 border-l-4 border-transparent
                                            transition-all duration-200 ease-in-out cursor-pointer
                                            ${!notification.is_read
                        ? 'bg-blue-50/50'
                        : getSeverityBgColor(notification.severity)}
                                            ${isNew ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                                            ${notification.is_resolved ? 'opacity-60 grayscale-[0.5]' : ''}
                                        `}
                    onClick={() =>
                      !notification.is_read && handleMarkAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.notification_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-gray-800 truncate">
                            {notification.title}
                          </h4>
                          {notification.is_resolved && (
                            <span className="bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">
                              Resolved
                            </span>
                          )}
                        </div>
                        {notification.patient_name && (
                          <p className="mt-1 text-xs font-medium text-gray-500">
                            Patient: {notification.patient_name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-1 leading-snug">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-gray-400 font-medium uppercase">
                            {formatNotificationTime(notification.created_at)}
                          </p>
                          {notification.severity === 'high' && !notification.is_resolved && (
                            <span className="text-[10px] text-red-600 font-bold animate-pulse">
                              CRITICAL
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isHighAndUnresolved && (
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(notification.id);
                          }}
                          className="bg-red-600 px-3 py-1 text-[11px] font-bold uppercase text-white shadow-sm transition-colors hover:bg-red-700"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;
