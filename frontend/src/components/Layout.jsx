import './Layout.css';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content-wrapper">{children}</main>
      <footer className="footer">
        <p>&copy; 2025 Quản Lý Tổ Dân Phố. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
