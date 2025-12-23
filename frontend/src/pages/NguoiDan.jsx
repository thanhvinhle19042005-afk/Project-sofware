import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { nguoiDanAPI, giaDinhAPI } from '../api';
import './Common.css';

const NguoiDan = () => {
  const [nguoiDans, setNguoiDans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [isChuHo, setIsChuHo] = useState(false);
  const [formData, setFormData] = useState({
    cccd: '',
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'Nam',
    soDienThoai: '',
    email: '',
    maGiaDinh: '',
    tamChu: false,
  });

  useEffect(() => {
    fetchNguoiDans();
  }, []);

  const fetchNguoiDans = async () => {
    try {
      setLoading(true);
      const response = await nguoiDanAPI.getAll();
      setNguoiDans(response.data || []);
    } catch (err) {
      setError('Không thể tải danh sách người dân');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchNguoiDans();
      return;
    }
    try {
      setLoading(true);
      const response = await nguoiDanAPI.search(searchKeyword);
      setNguoiDans(response.data || []);
    } catch (err) {
      setError('Không thể tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (citizen) => {
    setEditingCitizen(citizen);
    setIsChuHo(citizen.isChuHo || false);
    setFormData({
      cccd: citizen.cccd,
      hoTen: citizen.hoTen,
      ngaySinh: citizen.ngaySinh,
      gioiTinh: citizen.gioiTinh,
      soDienThoai: citizen.soDienThoai || '',
      email: citizen.email || '',
      maGiaDinh: citizen.maGiaDinh || '',
      tamChu: citizen.tamChu || false,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCitizen(null);
    setIsChuHo(false);
    setFormData({
      cccd: '',
      hoTen: '',
      ngaySinh: '',
      gioiTinh: 'Nam',
      soDienThoai: '',
      email: '',
      maGiaDinh: '',
      tamChu: false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCitizen) {
        await nguoiDanAPI.update(formData.cccd, { ...formData, isChuHo });
        alert('Cập nhật thông tin người dân thành công');
      } else {
        // Logic tạo mới
        if (isChuHo) {
          // 1. Tạo người dân trước (chưa có mã gia đình)
          const citizenData = { ...formData, maGiaDinh: null };
          await nguoiDanAPI.create(citizenData);

          // 2. Tạo gia đình mới (lấy CCCD làm chủ hộ)
          // Tạo mã gia đình tự động: GD + 6 số cuối CCCD + random 2 số
          const randomSuffix = Math.floor(Math.random() * 90 + 10);
          const newMaGiaDinh = `GD${formData.cccd.slice(-6)}${randomSuffix}`;
          
          await giaDinhAPI.create({
            maGiaDinh: newMaGiaDinh,
            cccdChuHo: formData.cccd,
            soThanhVien: 1
          });

          // 3. Cập nhật lại người dân với mã gia đình mới
          await nguoiDanAPI.update(formData.cccd, { ...citizenData, maGiaDinh: newMaGiaDinh });
          alert(`Thêm chủ hộ thành công. Mã gia đình mới: ${newMaGiaDinh}`);
        } else {
          // Tạo người dân bình thường (có thể có hoặc không có mã gia đình do người dùng nhập)
          await nguoiDanAPI.create(formData);
          alert('Thêm người dân thành công');
        }
      }
      setShowModal(false);
      fetchNguoiDans();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (cccd) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dân này?')) return;
    try {
      await nguoiDanAPI.delete(cccd);
      alert('Xóa người dân thành công');
      fetchNguoiDans();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản lý Cư dân</h1>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm tên hoặc CCCD..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn-add" onClick={handleAdd}>
            + Thêm Cư Dân
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>CCCD</th>
                  <th>Họ tên</th>
                  <th>Mã Gia Đình</th>
                  <th>Loại cư trú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {nguoiDans.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  nguoiDans.map((citizen) => (
                    <tr key={citizen.cccd}>
                      <td>{citizen.cccd}</td>
                      <td>{citizen.hoTen}</td>
                      <td>{citizen.maGiaDinh || '-'}</td>
                      <td>
                        <span className={`status-badge ${citizen.tamChu ? 'tam-tru' : 'thuong-tru'}`}>
                          {citizen.tamChu ? 'Tạm trú' : 'Thường trú'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="btn-edit" onClick={() => handleEdit(citizen)}>
                          Sửa
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(citizen.cccd)}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingCitizen ? 'Cập nhật thông tin' : 'Thêm cư dân mới'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>CCCD</label>
                    <input
                      type="text"
                      value={formData.cccd}
                      onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
                      disabled={!!editingCitizen}
                      required
                      maxLength="12"
                    />
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={formData.hoTen}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày sinh</label>
                    <input
                      type="date"
                      value={formData.ngaySinh}
                      onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giới tính</label>
                    <select
                      value={formData.gioiTinh}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      <input
                        type="checkbox"
                        checked={isChuHo}
                        onChange={(e) => {
                          setIsChuHo(e.target.checked);
                          if (e.target.checked && !editingCitizen) {
                            setFormData({ ...formData, maGiaDinh: '' }); // Clear manual input if becoming ChuHo (new)
                          }
                        }}
                      />
                      {editingCitizen ? 'Là Chủ Hộ' : 'Đăng ký là Chủ Hộ (Tạo gia đình mới)'}
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Mã Gia Đình {isChuHo && <span style={{fontSize: '0.8em', color: '#666'}}>(Tự động cấp)</span>}</label>
                    <input
                      type="text"
                      value={formData.maGiaDinh}
                      onChange={(e) => setFormData({ ...formData, maGiaDinh: e.target.value })}
                      disabled={isChuHo}
                      placeholder={isChuHo ? "Sẽ được cấp tự động" : "Nhập mã gia đình nếu có"}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="tel"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.tamChu}
                        onChange={(e) => setFormData({ ...formData, tamChu: e.target.checked })}
                      />
                      Đăng ký tạm trú
                    </label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingCitizen ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NguoiDan;
