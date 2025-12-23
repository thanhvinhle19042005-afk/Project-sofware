import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { nguoiDanAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import './Common.css';

const FamilyMembers = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user?.maGiaDinh) {
      fetchMembers();
    }
  }, [user]);

  const fetchMembers = async () => {
    try {
      const response = await nguoiDanAPI.getByGiaDinh(user.maGiaDinh);
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword = '') => {
    setSearching(true);
    try {
      // If keyword is empty, fetch all (or a default list)
      const response = keyword.trim() 
        ? await nguoiDanAPI.search(keyword)
        : await nguoiDanAPI.getAll(); // Assuming getAll exists and returns list

      // Filter out those who already have a family or are not household heads (meaning they can be added)
      // User request: "ma gia đình là rỗng ấy hoăc isChuHo false"
      const available = (response.data || []).filter(p => !p.maGiaDinh || p.isChuHo === false);
      setSearchResults(available);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  // Load available residents when modal opens
  useEffect(() => {
    if (showAddModal) {
      handleSearch('');
    }
  }, [showAddModal]);

  const handleAddMember = async (cccd) => {
    try {
      // Get current info first
      const personRes = await nguoiDanAPI.getById(cccd);
      const person = personRes.data;
      
      // Update with new family ID
      await nguoiDanAPI.update(cccd, {
        ...person,
        maGiaDinh: user.maGiaDinh
      });
      
      alert('Thêm thành viên thành công');
      setShowAddModal(false);
      fetchMembers();
      setSearchResults(prev => prev.filter(p => p.cccd !== cccd));
    } catch (error) {
      alert('Không thể thêm thành viên: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveMember = async (cccd) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này khỏi gia đình?')) return;
    try {
      const personRes = await nguoiDanAPI.getById(cccd);
      const person = personRes.data;
      
      await nguoiDanAPI.update(cccd, {
        ...person,
        maGiaDinh: null
      });
      
      alert('Đã xóa thành viên khỏi gia đình');
      fetchMembers();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    }
  };

  if (!user?.maGiaDinh) {
    return (
      <Layout>
        <div className="page-container">
          <div className="error-message">Bạn chưa được gán vào gia đình nào.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản lý Thành viên Gia đình</h1>
          <div style={{ fontSize: '1.1rem', color: '#666' }}>
            Mã gia đình: <strong>{user.maGiaDinh}</strong>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-box" style={{ visibility: 'hidden' }}>
            {/* Placeholder to keep layout */}
          </div>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            + Thêm Thành viên
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CCCD</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Quan hệ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có thành viên nào</td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.cccd}>
                    <td>{member.cccd}</td>
                    <td>{member.hoTen}</td>
                    <td>{new Date(member.ngaySinh).toLocaleDateString('vi-VN')}</td>
                    <td>
                      {member.cccd === user.cccd ? (
                        <span className="status-badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                          Chủ hộ (Bạn)
                        </span>
                      ) : 'Thành viên'}
                    </td>
                    <td className="actions-cell">
                      {member.cccd !== user.cccd && (
                        <button 
                          className="btn-delete"
                          onClick={() => handleRemoveMember(member.cccd)}
                        >
                          Xóa khỏi hộ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
              <h2>Thêm thành viên vào hộ</h2>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem', color: '#666' }}>
                  Tìm kiếm cư dân chưa có gia đình để thêm vào:
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Nhập tên hoặc CCCD..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <button 
                    onClick={() => handleSearch(searchKeyword)}
                    className="btn-add"
                    style={{ padding: '0.5rem 1rem' }}
                    disabled={searching}
                  >
                    {searching ? 'Tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                {searchResults.length > 0 ? (
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>CCCD</th>
                        <th>Họ tên</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(p => (
                        <tr key={p.cccd}>
                          <td>{p.cccd}</td>
                          <td>{p.hoTen}</td>
                          <td>
                            <button 
                              className="btn-edit"
                              onClick={() => handleAddMember(p.cccd)}
                            >
                              Thêm
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                    {searchKeyword ? 'Không tìm thấy cư dân phù hợp' : 'Đang tải danh sách...'}
                  </div>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FamilyMembers;
