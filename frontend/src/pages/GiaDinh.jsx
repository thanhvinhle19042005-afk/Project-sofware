import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { giaDinhAPI, nguoiDanAPI } from '../api';
import './Common.css';

const GiaDinh = () => {
  const [giaDinhs, setGiaDinhs] = useState([]);
  const [nguoiDans, setNguoiDans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [editingFamily, setEditingFamily] = useState(null);
  const [formData, setFormData] = useState({
    maGiaDinh: '',
    cccdChuHo: '',
    maBDS: '',
    soThanhVien: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [familiesRes, citizensRes] = await Promise.all([
        giaDinhAPI.getAll(),
        nguoiDanAPI.getAll()
      ]);
      setGiaDinhs(familiesRes.data || []);
      setNguoiDans(citizensRes.data || []);
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMembers = async (family) => {
    setSelectedFamily(family);
    try {
      const response = await nguoiDanAPI.getByGiaDinh(family.maGiaDinh);
      setFamilyMembers(response.data || []);
      setShowMembersModal(true);
    } catch (err) {
      alert('Không thể tải danh sách thành viên');
    }
  };

  const handleEdit = (family) => {
    setEditingFamily(family);
    setFormData({
      maGiaDinh: family.maGiaDinh,
      cccdChuHo: family.cccdChuHo || '',
      maBDS: family.maBDS || '',
      soThanhVien: family.soThanhVien || 0,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingFamily(null);
    setFormData({
      maGiaDinh: '',
      cccdChuHo: '',
      maBDS: '',
      soThanhVien: 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFamily) {
        await giaDinhAPI.update(formData.maGiaDinh, formData);
        alert('Cập nhật gia đình thành công');
      } else {
        await giaDinhAPI.create(formData);
        alert('Thêm gia đình thành công');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (maGiaDinh) => {
    if (!window.confirm('Bạn có chắc muốn xóa gia đình này?')) return;
    try {
      await giaDinhAPI.delete(maGiaDinh);
      alert('Xóa gia đình thành công');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getChuHoName = (cccd) => {
    const nguoiDan = nguoiDans.find(nd => nd.cccd === cccd);
    return nguoiDan ? nguoiDan.hoTen : '-';
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản lý Gia đình</h1>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm mã hộ hoặc chủ hộ..."
              // Logic tìm kiếm có thể thêm sau
            />
          </div>
          <button className="btn-add" onClick={handleAdd}>
            + Thêm Gia Đình
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
                  <th>Mã gia đình</th>
                  <th>Chủ hộ</th>
                  <th>CCCD chủ hộ</th>
                  <th>Số thành viên</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {giaDinhs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  giaDinhs.map((family) => (
                    <tr key={family.maGiaDinh}>
                      <td>{family.maGiaDinh}</td>
                      <td>{getChuHoName(family.cccdChuHo)}</td>
                      <td>{family.cccdChuHo || '-'}</td>
                      <td>{family.soThanhVien || 0}</td>
                      <td className="actions-cell">
                        <button className="btn-edit" onClick={() => handleViewMembers(family)}>
                          Xem
                        </button>
                        <button className="btn-edit" onClick={() => handleEdit(family)}>
                          Sửa
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(family.maGiaDinh)}>
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
              <h2>{editingFamily ? 'Cập nhật gia đình' : 'Thêm gia đình'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mã gia đình *</label>
                    <input
                      type="text"
                      value={formData.maGiaDinh}
                      onChange={(e) => setFormData({ ...formData, maGiaDinh: e.target.value })}
                      required
                      disabled={!!editingFamily}
                    />
                  </div>
                  <div className="form-group">
                    <label>CCCD chủ hộ</label>
                    <select
                      value={formData.cccdChuHo}
                      onChange={(e) => setFormData({ ...formData, cccdChuHo: e.target.value })}
                    >
                      <option value="">-- Chọn chủ hộ --</option>
                      {nguoiDans.map(nd => (
                        <option key={nd.cccd} value={nd.cccd}>{nd.hoTen} - {nd.cccd}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Số thành viên</label>
                    <input
                      type="number"
                      value={formData.soThanhVien}
                      onChange={(e) => setFormData({ ...formData, soThanhVien: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingFamily ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showMembersModal && (
          <div className="modal-overlay">
            <div className="modal-content modal-large">
              <h2>Thành viên gia đình: {selectedFamily?.maGiaDinh}</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>CCCD</th>
                      <th>Họ tên</th>
                      <th>Ngày sinh</th>
                      <th>Giới tính</th>
                      <th>Số điện thoại</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>Chưa có thành viên</td>
                      </tr>
                    ) : (
                      familyMembers.map((member) => (
                        <tr key={member.cccd}>
                          <td>{member.cccd}</td>
                          <td>{member.hoTen}</td>
                          <td>{member.ngaySinh}</td>
                          <td>{member.gioiTinh}</td>
                          <td>{member.soDienThoai || '-'}</td>
                          <td>{member.email || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowMembersModal(false)} className="btn-cancel">Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GiaDinh;
