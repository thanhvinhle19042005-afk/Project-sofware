import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, nguoiDanAPI } from '../api';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    // Thông tin tài khoản
    tenDangNhap: '',
    matKhau: '',
    confirmPassword: '',
    // Thông tin người dân
    cccd: '',
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    soDienThoai: '',
    email: '',
    tamChu: false,
    isChuHo: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.matKhau !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (formData.matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!formData.cccd || formData.cccd.length !== 12) {
      setError('CCCD phải có đúng 12 số');
      return;
    }

    if (!formData.ngaySinh) {
      setError('Vui lòng nhập ngày sinh');
      return;
    }

    setLoading(true);

    try {
      // Gửi toàn bộ thông tin trong một request
      const response = await authAPI.register({
        tenDangNhap: formData.tenDangNhap,
        matKhau: formData.matKhau,
        cccd: formData.cccd,
        hoTen: formData.hoTen,
        ngaySinh: formData.ngaySinh,
        gioiTinh: formData.gioiTinh,
        soDienThoai: formData.soDienThoai || null,
        email: formData.email || null,
        tamChu: formData.tamChu,
        isChuHo: formData.isChuHo,
      });

      if (response.success) {
        navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
      } else {
        setError(response.message || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Quản Lý Tổ Dân Phố</h1>
          <h2>Đăng ký tài khoản</h2>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            Vui lòng điền đầy đủ thông tin bên dưới
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          {/* PHẦN 1: THÔNG TIN TÀI KHOẢN */}
          <div className="form-section">
            <h3 className="section-title">Thông tin tài khoản</h3>
            
            <div className="form-group">
              <label htmlFor="tenDangNhap">Tên đăng nhập *</label>
              <input
                type="text"
                id="tenDangNhap"
                name="tenDangNhap"
                value={formData.tenDangNhap}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Chọn tên đăng nhập"
                minLength={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="matKhau">Mật khẩu *</label>
                <input
                  type="password"
                  id="matKhau"
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Ít nhất 6 ký tự"
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </div>
          </div>

          {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
          <div className="form-section">
            <h3 className="section-title">Thông tin cá nhân</h3>
            
            <div className="form-group">
              <label htmlFor="cccd">Số CCCD *</label>
              <input
                type="text"
                id="cccd"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Nhập 12 số CCCD"
                maxLength={12}
                pattern="[0-9]{12}"
              />
            </div>

            <div className="form-group">
              <label htmlFor="hoTen">Họ và tên *</label>
              <input
                type="text"
                id="hoTen"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ngaySinh">Ngày sinh *</label>
                <input
                  type="date"
                  id="ngaySinh"
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gioiTinh">Giới tính *</label>
                <select
                  id="gioiTinh"
                  name="gioiTinh"
                  value={formData.gioiTinh}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="soDienThoai">Số điện thoại</label>
                <input
                  type="tel"
                  id="soDienThoai"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="tamChu"
                  checked={formData.tamChu}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Tạm trú (không phải thường trú)</span>
              </label>
            </div>

            <div className="form-group">
              <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  name="isChuHo"
                  checked={formData.isChuHo}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span style={{ fontWeight: 'bold' }}>Đăng ký là Chủ Hộ (Tạo gia đình mới)</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
