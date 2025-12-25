import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { suKienAPI, dangKySuKienAPI, authAPI, taiLieuAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, getEventStatus, getEventStatusColor } from '../utils/helpers';
import './EventDetail.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [admins, setAdmins] = useState([]);
  
  // State for documents
  const [documents, setDocuments] = useState([]);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDocument, setNewDocument] = useState({
    tenTaiLieu: '',
    loaiTaiLieu: 'DOCUMENT',
    duongDanFile: '',
  });

  // State for meeting minutes
  const [minutes, setMinutes] = useState(null);
  const [showMinutesForm, setShowMinutesForm] = useState(false);
  const [minutesData, setMinutesData] = useState({
    noiDung: '',
    ketLuan: '',
    nguoiGhiNhan: '',
  });

  // State for participants
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showAddParticipantForm, setShowAddParticipantForm] = useState(false);
  const [newParticipantCCCD, setNewParticipantCCCD] = useState('');

  useEffect(() => {
    fetchEventDetails();
    if (isAdmin()) {
      fetchAdmins();
    }
  }, [id]);

  const fetchAdmins = async () => {
    try {
      const response = await authAPI.getAdmins();
      if (response.success) {
        setAdmins(response.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchEventDetails = async () => {
    try {
      const response = await suKienAPI.getById(id);
      if (response.success) {
        setEvent(response.data);
        // Check if user is registered
        if (!isAdmin()) {
          checkRegistrationStatus();
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      alert('Không thể tải thông tin sự kiện');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await dangKySuKienAPI.getMyRegistrations();
      if (response.success) {
        const isRegistered = response.data.some(reg => reg.maSuKien === parseInt(id) && reg.trangThai !== 'Hủy đăng ký');
        setIsRegistered(isRegistered);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const response = await dangKySuKienAPI.register(id);
      if (response.success) {
        alert('Đăng ký tham gia thành công!');
        setIsRegistered(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể đăng ký');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy tham gia sự kiện này?')) return;
    
    setRegistering(true);
    try {
      // First get the registration ID
      const response = await dangKySuKienAPI.getMyRegistrations();
      if (response.success) {
        const registration = response.data.find(reg => reg.maSuKien === parseInt(id) && reg.trangThai !== 'Hủy đăng ký');
        if (registration) {
          await dangKySuKienAPI.cancel(registration.maDangKy);
          alert('Đã hủy tham gia sự kiện');
          setIsRegistered(false);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đăng ký');
    } finally {
      setRegistering(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setNewDocument({ ...newDocument, tenTaiLieu: file.name });
    }
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    if (!selectedFile && !newDocument.duongDanFile) {
      alert('Vui lòng chọn file hoặc nhập URL');
      return;
    }

    // Mock add document with file
    const doc = {
      maTaiLieu: Date.now(),
      ...newDocument,
      duongDanFile: selectedFile ? URL.createObjectURL(selectedFile) : newDocument.duongDanFile,
      fileName: selectedFile ? selectedFile.name : newDocument.tenTaiLieu,
      thoiGianThem: new Date().toISOString(),
    };
    setDocuments([...documents, doc]);
    setNewDocument({ tenTaiLieu: '', loaiTaiLieu: 'DOCUMENT', duongDanFile: '' });
    setSelectedFile(null);
    setShowDocumentForm(false);
    alert('Thêm tài liệu thành công!');
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      return;
    }
    try {
      // Mock delete - replace with real API call if needed, or use taiLieuAPI.delete(docId)
      // await taiLieuAPI.delete(docId);
      setDocuments(documents.filter(d => d.maTaiLieu !== docId));
      alert('Xóa tài liệu thành công');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Không thể xóa tài liệu');
    }
  };

  const handleSaveMinutes = async (e) => {
    e.preventDefault();
    // Mock save minutes - replace with real API call
    const newMinutes = {
      ...minutesData,
      thoiGianGhiNhan: new Date().toISOString(),
    };
    setMinutes(newMinutes);
    setShowMinutesForm(false);
    alert('Lưu biên bản thành công!');
  };

  const handleLoadParticipants = async () => {
    try {
      const response = await dangKySuKienAPI.getEventRegistrations(id);
      if (response.success) {
        setParticipants(response.data);
        setShowParticipants(true);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      alert('Không thể tải danh sách tham gia');
    }
  };

  const handleRemoveParticipant = async (registrationId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người này khỏi sự kiện?')) return;
    
    try {
      await dangKySuKienAPI.cancel(registrationId);
      alert('Đã xóa người tham gia');
      handleLoadParticipants(); // Reload list
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Không thể xóa người tham gia');
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantCCCD.trim()) return;

    try {
      const response = await dangKySuKienAPI.adminRegisterUser({
        maSuKien: parseInt(id),
        cccd: newParticipantCCCD.trim()
      });
      
      if (response.success) {
        alert('Thêm người tham gia thành công');
        setNewParticipantCCCD('');
        setShowAddParticipantForm(false);
        handleLoadParticipants(); // Reload list
      }
    } catch (error) {
      console.error('Error adding participant:', error);
      alert(error.response?.data?.message || 'Không thể thêm người tham gia. Kiểm tra lại CCCD.');
    }
  };

  const handleRejectEvent = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy sự kiện này không?')) {
      return;
    }
    try {
      const response = await suKienAPI.reject(id);
      if (response.success) {
        alert('Đã hủy sự kiện thành công');
        fetchEventDetails();
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      alert('Không thể hủy sự kiện');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="error">Không tìm thấy sự kiện</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="event-detail-page">
        <div className="detail-header">
          <div className="header-top">
            <button onClick={() => navigate('/events')} className="btn-back">
              ← Quay lại
            </button>
            {isAdmin() && event.trangThai !== 'Hủy bỏ' && (
              <button onClick={handleRejectEvent} className="btn-reject">
                Hủy sự kiện
              </button>
            )}
          </div>
          <h1>{event.tenSuKien}</h1>
          <span
            className="event-status-badge"
            style={{ backgroundColor: getEventStatusColor(event) }}
          >
            {getEventStatus(event)}
          </span>
        </div>

        <div className="detail-grid">
          {/* Event Info */}
          <div className="detail-card">
            <h2>Thông tin sự kiện</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="label">Loại sự kiện:</span>
                <span className="value">{event.loaiSuKien}</span>
              </div>
              <div className="info-item">
                <span className="label">Thời gian:</span>
                <span className="value">
                  {formatDateTime(event.thoiGianBatDau)}
                  <br />
                  - {formatDateTime(event.thoiGianKetThuc)}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Địa điểm:</span>
                <span className="value">{event.diaDiem}</span>
              </div>
              {event.soLuongToiDa && (
                <div className="info-item">
                  <span className="label">Số lượng:</span>
                  <span className="value">Tối đa {event.soLuongToiDa} người</span>
                </div>
              )}
              {event.phiThamGia > 0 && (
                <div className="info-item">
                  <span className="label">Phí tham gia:</span>
                  <span className="value">{event.phiThamGia.toLocaleString()} VNĐ</span>
                </div>
              )}
            </div>
            {event.moTa && (
              <div className="event-description">
                <h3>Mô tả:</h3>
                <p>{event.moTa}</p>
              </div>
            )}
            
            {!isAdmin() && event.trangThai !== 'Đã kết thúc' && event.trangThai !== 'Hủy bỏ' && (
              <div className="action-bar" style={{ marginTop: '20px' }}>
                {isRegistered ? (
                  <button 
                    className="btn-register cancel" 
                    onClick={handleCancelRegistration}
                    disabled={registering}
                    style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', width: '100%' }}
                  >
                    {registering ? 'Đang xử lý...' : 'Hủy tham gia'}
                  </button>
                ) : (
                  <button 
                    className="btn-register" 
                    onClick={handleRegister}
                    disabled={registering}
                    style={{ width: '100%' }}
                  >
                    {registering ? 'Đang xử lý...' : 'Đăng ký tham gia'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Documents Section - Admin only */}
          {isAdmin() && (
            <div className="detail-card">
              <div className="card-header">
                <h2>Tài liệu đính kèm</h2>
                <button
                  onClick={() => setShowDocumentForm(!showDocumentForm)}
                  className="btn-add"
                >
                  + Thêm tài liệu
                </button>
              </div>

              {showDocumentForm && (
                <form onSubmit={handleAddDocument} className="document-form">
                  <input
                    type="text"
                    placeholder="Tên tài liệu"
                    value={newDocument.tenTaiLieu}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, tenTaiLieu: e.target.value })
                    }
                    required={!selectedFile}
                  />
                  <select
                    value={newDocument.loaiTaiLieu}
                    onChange={(e) =>
                      setNewDocument({ ...newDocument, loaiTaiLieu: e.target.value })
                    }
                  >
                    <option value="DOCUMENT">Tài liệu</option>
                    <option value="IMAGE">Hình ảnh</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  <div className="file-upload-section">
                    <label className="file-upload-label">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="file-input"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <span className="file-upload-btn">
                        📎 {selectedFile ? selectedFile.name : 'Chọn file từ máy'}
                      </span>
                    </label>
                    <span className="file-separator">hoặc</span>
                    <input
                      type="url"
                      placeholder="Nhập URL tài liệu"
                      value={newDocument.duongDanFile}
                      onChange={(e) =>
                        setNewDocument({ ...newDocument, duongDanFile: e.target.value })
                      }
                      disabled={!!selectedFile}
                    />
                  </div>
                  <div className="form-actions-inline">
                    <button type="submit" className="btn-save">
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDocumentForm(false);
                        setSelectedFile(null);
                      }}
                      className="btn-cancel-inline"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              <div className="documents-list">
                {documents.length === 0 ? (
                  <p className="no-data">Chưa có tài liệu nào</p>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.maTaiLieu} className="document-item">
                      <div className="doc-info">
                        <strong>{doc.tenTaiLieu}</strong>
                        <span className="doc-type">{doc.loaiTaiLieu}</span>
                      </div>
                      <div className="doc-actions">
                        <a
                          href={doc.duongDanFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-download"
                        >
                          Tải xuống
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.maTaiLieu)}
                          className="btn-delete-doc"
                          style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Meeting Minutes - Admin only */}
          {isAdmin() && (
            <div className="detail-card">
              <div className="card-header">
                <h2>Biên bản cuộc họp</h2>
                {!minutes && (
                  <button
                    onClick={() => setShowMinutesForm(!showMinutesForm)}
                    className="btn-add"
                  >
                    + Ghi nhận biên bản
                  </button>
                )}
              </div>

              {showMinutesForm && !minutes && (
                <form onSubmit={handleSaveMinutes} className="minutes-form">
                  <textarea
                    placeholder="Nội dung biên bản"
                    value={minutesData.noiDung}
                    onChange={(e) =>
                      setMinutesData({ ...minutesData, noiDung: e.target.value })
                    }
                    rows="6"
                    required
                  />
                  <textarea
                    placeholder="Kết luận"
                    value={minutesData.ketLuan}
                    onChange={(e) =>
                      setMinutesData({ ...minutesData, ketLuan: e.target.value })
                    }
                    rows="3"
                    required
                  />
                  <select
                    value={minutesData.nguoiGhiNhan}
                    onChange={(e) =>
                      setMinutesData({ ...minutesData, nguoiGhiNhan: e.target.value })
                    }
                    required
                    className="admin-select"
                  >
                    <option value="">-- Chọn người ghi nhận --</option>
                    {admins.map((admin) => (
                      <option key={admin.tenDangNhap} value={admin.tenDangNhap}>
                        {admin.tenDangNhap}
                      </option>
                    ))}
                  </select>
                  <div className="form-actions-inline">
                    <button type="submit" className="btn-save">
                      Lưu biên bản
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMinutesForm(false)}
                      className="btn-cancel-inline"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Participants - Admin only */}
          {isAdmin() && (
            <div className="detail-card">
              <div className="card-header">
                <h2>Danh sách tham gia</h2>
                <div className="header-actions">
                  {!showParticipants && (
                    <button onClick={handleLoadParticipants} className="btn-load">
                      Xem danh sách
                    </button>
                  )}
                  {showParticipants && (
                    <button 
                      onClick={() => setShowAddParticipantForm(!showAddParticipantForm)} 
                      className="btn-add"
                    >
                      + Thêm người tham gia
                    </button>
                  )}
                </div>
              </div>

              {showAddParticipantForm && (
                <form onSubmit={handleAddParticipant} className="document-form">
                  <div className="form-group">
                    <label>Nhập CCCD người dân:</label>
                    <input
                      type="text"
                      value={newParticipantCCCD}
                      onChange={(e) => setNewParticipantCCCD(e.target.value)}
                      placeholder="Ví dụ: 001234567890"
                      required
                    />
                  </div>
                  <div className="form-actions-inline">
                    <button type="submit" className="btn-save">Thêm</button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddParticipantForm(false)}
                      className="btn-cancel-inline"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {showParticipants && (
                <div className="participants-list">
                  {participants.length === 0 ? (
                    <p className="no-data">Chưa có người đăng ký</p>
                  ) : (
                    <table className="participants-table">
                      <thead>
                        <tr>
                          <th>Họ tên</th>
                          <th>CCCD</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p) => (
                          <tr key={p.maDangKy}>
                            <td>{p.hoTenNguoiDangKy || 'N/A'}</td>
                            <td>{p.cccdNguoiDangKy || 'N/A'}</td>
                            <td>
                              <span className={`status-badge ${p.trangThai === 'Hủy đăng ký' ? 'cancelled' : 'active'}`}>
                                {p.trangThai}
                              </span>
                            </td>
                            <td>
                              {p.trangThai !== 'Hủy đăng ký' && (
                                <button 
                                  className="btn-delete-doc"
                                  style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                  onClick={() => handleRemoveParticipant(p.maDangKy)}
                                >
                                  Xóa
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
