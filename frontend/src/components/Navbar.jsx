import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

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
