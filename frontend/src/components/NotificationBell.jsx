import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { API_URL, getHeaders, apiFetch } from '../config/api';

const typeStyles = {
  info: {
    row: 'border-l-4 border-l-blue-500',
    unread: 'bg-blue-50/60 hover:bg-blue-50',
  },
  success: {
    row: 'border-l-4 border-l-emerald-500',
    unread: 'bg-emerald-50/60 hover:bg-emerald-50',
  },
  warning: {
    row: 'border-l-4 border-l-amber-500',
    unread: 'bg-amber-50/60 hover:bg-amber-50',
  },
  error: {
    row: 'border-l-4 border-l-red-500',
    unread: 'bg-red-50/60 hover:bg-red-50',
  },
};

const arabicNumber = new Intl.NumberFormat('ar-SA');

function formatRelativeTime(value) {
  if (!value) return 'الآن';

  const date = new Date(value.endsWith('Z') ? value : value + 'Z');
  if (Number.isNaN(date.getTime())) return 'الآن';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes === 1) return 'منذ دقيقة';
  if (diffMinutes === 2) return 'منذ دقيقتين';
  if (diffMinutes < 60) return `منذ ${arabicNumber.format(diffMinutes)} دقائق`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return 'منذ ساعة';
  if (diffHours === 2) return 'منذ ساعتين';
  if (diffHours < 24) return `منذ ${arabicNumber.format(diffHours)} ساعات`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'منذ يوم';
  if (diffDays === 2) return 'منذ يومين';
  return `منذ ${arabicNumber.format(diffDays)} أيام`;
}

function NotificationBell() {
  const token = localStorage.getItem('token');
  const panelRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(() => !!token);
  const [error, setError] = useState('');
  const [readingId, setReadingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    const controller = new AbortController();

    const fetchNotifications = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await apiFetch(`${API_URL}/notifications`, {
          headers: getHeaders(false),
          signal: controller.signal,
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          setError(data?.detail || 'تعذر تحميل الإشعارات');
          return;
        }

        setNotifications(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError('تعذر تحميل الإشعارات');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchNotifications();

    return () => controller.abort();
  }, [token]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  if (!token) return null;

  const unreadCount = notifications.filter((notification) => !notification.IsRead).length;
  const unreadLabel = unreadCount > 99 ? '99+' : arabicNumber.format(unreadCount);

  const handleRetry = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/notifications`, {
        headers: getHeaders(false),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.detail || 'تعذر تحميل الإشعارات');
        return;
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setError('تعذر تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    const notification = notifications.find((item) => item.NotificationID === notificationId);
    if (!notification || notification.IsRead || readingId === notificationId) return;

    setReadingId(notificationId);

    try {
      const res = await apiFetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: getHeaders(false),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.detail || 'تعذر تحديث الإشعار');
        return;
      }

      setNotifications((current) =>
        current.map((item) =>
          item.NotificationID === notificationId ? { ...item, IsRead: true } : item
        )
      );
    } catch {
      setError('تعذر تحديث الإشعار');
    } finally {
      setReadingId(null);
    }
  };

  const markAllAsRead = async () => {
    if (markingAll || unreadCount === 0) return;

    setMarkingAll(true);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: getHeaders(false),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.detail || 'تعذر تحديث الإشعارات');
        return;
      }

      setNotifications((current) => current.map((item) => ({ ...item, IsRead: true })));
    } catch {
      setError('تعذر تحديث الإشعارات');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-[#1a3a5c]"
        aria-label="الإشعارات"
      >
        <Bell size={17} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full border-2 border-white bg-red-500 px-1 py-0.5 text-center text-[10px] font-bold leading-none text-white">
            {unreadLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={markingAll || unreadCount === 0}
              className="text-xs font-bold text-[#1a3a5c] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}
            </button>
            <div className="text-right">
              <p className="text-sm font-black text-gray-900">الإشعارات</p>
              <p className="text-[11px] text-gray-400">
                {unreadCount > 0 ? `${arabicNumber.format(unreadCount)} غير مقروءة` : 'كل الإشعارات مقروءة'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm font-medium text-gray-500">
              <Loader2 size={16} className="animate-spin text-[#1a3a5c]" />
              جاري تحميل الإشعارات...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-right">
              <div className="mb-3 flex items-start justify-end gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                <span>{error}</span>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#eef2f7] text-[#1a3a5c]">
                <Bell size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-700">لا توجد إشعارات حالياً</p>
            </div>
          ) : (
            <div className="max-h-[24rem] overflow-y-auto">
              {notifications.map((notification) => {
                const styles = typeStyles[notification.Type] || typeStyles.info;
                const isUnread = !notification.IsRead;
                const isUpdating = readingId === notification.NotificationID;

                return (
                  <button
                    key={notification.NotificationID}
                    type="button"
                    onClick={() => markAsRead(notification.NotificationID)}
                    className={`block w-full border-b border-gray-100 px-4 py-3 text-right transition-colors last:border-b-0 ${styles.row} ${
                      isUnread ? styles.unread : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-400">
                        {isUpdating ? <Loader2 size={12} className="animate-spin" /> : null}
                        {!isUnread ? <CheckCheck size={12} className="text-emerald-600" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-6 ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.Message}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">{formatRelativeTime(notification.CreatedAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
