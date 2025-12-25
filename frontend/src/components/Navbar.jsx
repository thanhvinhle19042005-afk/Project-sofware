import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { thongBaoAPI } from '../api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]); // Re-fetch when changing pages (especially coming back from Notifications)

  const fetchUnreadCount = async () => {
    try {
      const response = await thongBaoAPI.getMyNotifications();
      if (response.success && Array.isArray(response.data)) {
        const count = response.data.filter(n => !n.daDoc).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '◀' : '▶'}
      </button>
      
      <div className="sidebar-content">
        <Link to="/" className="sidebar-brand">
          {isOpen ? 'Quản Lý Tổ Dân Phố' : 'QLTDP'}
        </Link>

        <div className="sidebar-menu">
          <Link to="/events" className="sidebar-link">
            {isOpen ? 'Quản lý Hoạt động' : 'HĐ'}
          </Link>
          <Link to="/schedule" className="sidebar-link">
            {isOpen ? 'Lịch biểu' : 'LB'}
          </Link>

          <Link to="/notifications" className="sidebar-link" style={{ position: 'relative' }}>
            {isOpen ? 'Thông báo' : 'TB'}
            {unreadCount > 0 && (
              <span className={`notification-badge ${isOpen ? 'open' : 'closed'}`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          
          {/* Link cho Chủ hộ */}
          {user?.maGiaDinh && (
             <Link to="/family-members" className="sidebar-link">
               {isOpen ? 'Quản lý Thành viên' : 'TV'}
             </Link>
          )}

          {isAdmin() && (
            <>
              <Link to="/nguoi-dan" className="sidebar-link">
                {isOpen ? 'Quản lý Cư dân' : 'CD'}
              </Link>
              <Link to="/gia-dinh" className="sidebar-link">
                {isOpen ? 'Quản lý Gia đình' : 'GD'}
              </Link>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {isOpen && (
              <div className="user-info">
                <span className="user-name">{user?.username}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="btn-logout">
            {isOpen ? 'Đăng xuất' : 'DX'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
