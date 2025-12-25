import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { thongBaoAPI } from '../api';
import { formatDateTime } from '../utils/helpers';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await thongBaoAPI.getMyNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="notifications-page">
        <h1>Thông báo của tôi</h1>

        {notifications.length === 0 ? (
          <div className="no-data">Không có thông báo nào</div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.maNhanThongBao}
                className={`notification-card ${notification.daDoc ? 'read' : 'unread'}`}
              >
                <div className="notification-header">
                  <h3>{notification.tieuDe}</h3>
                  <span className={`priority-badge ${notification.doKhan}`}>
                    {notification.doKhan === 'EMERGENCY' ? 'Khẩn cấp' : 'Bình thường'}
                  </span>
                </div>

                <div className="notification-body">
                  <p>{notification.noiDung}</p>
                </div>

                <div className="notification-footer">
                  <span className="notification-time">
                    {formatDateTime(notification.thoiGianGui)}
                  </span>
                  {notification.daDoc && (
                    <span className="read-status">
                      Đã đọc lúc {formatDateTime(notification.thoiGianDoc)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
