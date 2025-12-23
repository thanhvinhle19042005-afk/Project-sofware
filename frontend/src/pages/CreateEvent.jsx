import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { suKienAPI } from '../api';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    tenSuKien: '',
    moTa: '',
    diaDiem: '',
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    soLuongToiDa: '',
    loaiSuKien: 'MEETING',
    phiThamGia: '0',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format datetime fields to include seconds for backend
      const dataToSend = {
        ...formData,
        thoiGianBatDau: formData.thoiGianBatDau ? `${formData.thoiGianBatDau}:00` : '',
        thoiGianKetThuc: formData.thoiGianKetThuc ? `${formData.thoiGianKetThuc}:00` : '',
      };
      
      const response = await suKienAPI.create(dataToSend);
      if (response.success) {
        alert('Tạo sự kiện thành công!');
        navigate('/events');
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="create-event-page">
        <div className="page-header">
          <h1>Tạo sự kiện mới</h1>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="tenSuKien">Tên sự kiện *</label>
            <input
              type="text"
              id="tenSuKien"
              name="tenSuKien"
              value={formData.tenSuKien}
              onChange={handleChange}
              required
              placeholder="Nhập tên sự kiện"
            />
          </div>

          <div className="form-group">
            <label htmlFor="loaiSuKien">Loại sự kiện *</label>
            <select
              id="loaiSuKien"
              name="loaiSuKien"
              value={formData.loaiSuKien}
              onChange={handleChange}
              required
            >
              <option value="MEETING">Cuộc họp</option>
              <option value="ACTIVITY">Hoạt động</option>
              <option value="EMERGENCY">Khẩn cấp</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="thoiGianBatDau">Thời gian bắt đầu *</label>
              <input
                type="datetime-local"
                id="thoiGianBatDau"
                name="thoiGianBatDau"
                value={formData.thoiGianBatDau}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="thoiGianKetThuc">Thời gian kết thúc *</label>
              <input
                type="datetime-local"
                id="thoiGianKetThuc"
                name="thoiGianKetThuc"
                value={formData.thoiGianKetThuc}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="diaDiem">Địa điểm *</label>
            <input
              type="text"
              id="diaDiem"
              name="diaDiem"
              value={formData.diaDiem}
              onChange={handleChange}
              required
              placeholder="Nhập địa điểm tổ chức"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="soLuongToiDa">Số lượng tối đa</label>
              <input
                type="number"
                id="soLuongToiDa"
                name="soLuongToiDa"
                value={formData.soLuongToiDa}
                onChange={handleChange}
                placeholder="Để trống nếu không giới hạn"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phiThamGia">Phí tham gia (VNĐ)</label>
              <input
                type="number"
                id="phiThamGia"
                name="phiThamGia"
                value={formData.phiThamGia}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="moTa">Mô tả sự kiện</label>
            <textarea
              id="moTa"
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              rows="6"
              placeholder="Nhập mô tả chi tiết về sự kiện"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvent;
