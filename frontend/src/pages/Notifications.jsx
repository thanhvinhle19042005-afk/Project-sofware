import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { thongBaoAPI } from '../api';
import { formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import './Notifications.css';

const Notifications = () => {
  const { isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNotification, setNewNotification] = useState({
    tieuDe: '',
    noiDung: '',
    doKhan: 'Bình thường'
  });

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (activeTab === 'received') {
        const response = await thongBaoAPI.getMyNotifications();
        if (response.success) {
          setNotifications(response.data);
        }
      } else if (activeTab === 'sent' && isAdmin()) {
        const response = await thongBaoAPI.getSentNotifications();
        if (response.success) {
          setSentNotifications(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (activeTab === 'sent') return; // Cannot mark sent notifications as read
    if (notification.daDoc) return;

    try {
      await thongBaoAPI.markAsRead(notification.maThongBao);
      setNotifications(prev => 
        prev.map(n => 
          n.maThongBao === notification.maThongBao 
            ? { ...n, daDoc: true, thoiGianDoc: new Date().toISOString() } 
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await thongBaoAPI.create(newNotification);
      if (response.success) {
        alert('Tạo thông báo thành công!');
        setShowCreateModal(false);
        setNewNotification({ tieuDe: '', noiDung: '', doKhan: 'Bình thường' });
        if (activeTab === 'sent') {
          fetchNotifications();
        } else {
          setActiveTab('sent');
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      alert('Có lỗi xảy ra khi tạo thông báo');
    } finally {
      setCreating(false);
    }
  };

  if (loading && notifications.length === 0 && sentNotifications.length === 0) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  const displayNotifications = activeTab === 'received' ? notifications : sentNotifications;

  return (
    <Layout>
      <div className="notifications-page">
        <div className="page-header-flex">
          <h1>Thông báo</h1>
          {isAdmin() && (
            <button 
              className="btn-create-notification"
              onClick={() => setShowCreateModal(true)}
            >
              + Tạo thông báo mới
            </button>
          )}
        </div>

        {isAdmin() && (
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Hộp thư đến
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Đã gửi
            </button>
          </div>
        )}

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Tạo thông báo mới</h2>
              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label>Tiêu đề</label>
                  <input
                    type="text"
                    value={newNotification.tieuDe}
                    onChange={(e) => setNewNotification({...newNotification, tieuDe: e.target.value})}
                    required
                    placeholder="Nhập tiêu đề thông báo"
                  />
                </div>
                <div className="form-group">
                  <label>Độ khẩn</label>
                  <select
                    value={newNotification.doKhan}
                    onChange={(e) => setNewNotification({...newNotification, doKhan: e.target.value})}
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nội dung</label>
                  <textarea
                    value={newNotification.noiDung}
                    onChange={(e) => setNewNotification({...newNotification, noiDung: e.target.value})}
                    required
                    placeholder="Nhập nội dung thông báo"
                    rows="4"
                  />
                </div>
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creating}
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={creating}
                  >
                    {creating ? 'Đang gửi...' : 'Gửi thông báo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {displayNotifications.length === 0 ? (
          <div className="no-data">Không có thông báo nào</div>
        ) : (
          <div className="notifications-list">
            {displayNotifications.map((notification) => (
              <div
                key={notification.maNhanThongBao || notification.maThongBao}
                className={`notification-card ${activeTab === 'received' ? (notification.daDoc ? 'read' : 'unread') : ''}`}
                onClick={() => handleMarkAsRead(notification)}
                style={{ cursor: activeTab === 'received' && !notification.daDoc ? 'pointer' : 'default' }}
              >
                <div className="notification-header">
                  <h3>{notification.tieuDe}</h3>
                  <span className={`priority-badge ${notification.doKhan === 'Khẩn cấp' ? 'emergency' : 'normal'}`}>
                    {notification.doKhan}
                  </span>
                </div>

                <div className="notification-body">
                  <p>{notification.noiDung}</p>
                </div>

                <div className="notification-footer">
                  <span className="notification-time">
                    {formatDateTime(notification.thoiGianGui)}
                  </span>
                  {activeTab === 'received' && notification.daDoc && (
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
