import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { suKienAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, getEventStatus, getEventStatusColor } from '../utils/helpers';
import './Common.css';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState('joined'); // joined, notJoined (for residents)
  const [subTab, setSubTab] = useState('all'); // all, upcoming, past
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [mainTab]); // Refetch when main tab changes (for residents)

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let response;
      if (isAdmin()) {
        response = await suKienAPI.getAll();
      } else {
        if (mainTab === 'joined') {
          response = await suKienAPI.getJoined();
        } else {
          response = await suKienAPI.getNotJoined();
        }
      }

      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const status = getEventStatus(event);
    
    // Admin filters
    if (isAdmin()) {
      if (subTab === 'all') return true;
      if (subTab === 'upcoming') return status === 'Sắp diễn ra' || status === 'Đang diễn ra';
      if (subTab === 'past') return status === 'Đã kết thúc';
      if (subTab === 'cancelled') return event.trangThai === 'Hủy bỏ';
      return true;
    }

    // Resident filters
    if (subTab === 'all') return true;
    if (subTab === 'upcoming') return status === 'Sắp diễn ra' || status === 'Đang diễn ra';
    if (subTab === 'past') return status === 'Đã kết thúc';
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="loading">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Quản lý Hoạt động</h1>
        </div>

        <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
          
          {/* Main Tabs for Residents */}
          {!isAdmin() && (
            <div className="main-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', width: '100%' }}>
              <button
                className={`tab-btn ${mainTab === 'joined' ? 'active' : ''}`}
                onClick={() => { setMainTab('joined'); setSubTab('all'); }}
              >
                Đã tham gia
              </button>
              <button
                className={`tab-btn ${mainTab === 'notJoined' ? 'active' : ''}`}
                onClick={() => { setMainTab('notJoined'); setSubTab('all'); }}
              >
                Chưa tham gia
              </button>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div className="filter-group" style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`filter-btn ${subTab === 'all' ? 'active' : ''}`}
                onClick={() => setSubTab('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-btn ${subTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setSubTab('upcoming')}
              >
                Sắp diễn ra
              </button>
              <button
                className={`filter-btn ${subTab === 'past' ? 'active' : ''}`}
                onClick={() => setSubTab('past')}
              >
                Đã kết thúc
              </button>
              {isAdmin() && (
                <button
                  className={`filter-btn ${subTab === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setSubTab('cancelled')}
                >
                  Đã hủy
                </button>
              )}
            </div>
            
            {isAdmin() && (
              <Link to="/events/create" className="btn-add">
                + Tạo sự kiện mới
              </Link>
            )}
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên sự kiện</th>
                <th>Thời gian</th>
                <th>Địa điểm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Không có sự kiện nào</td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.maSuKien}>
                    <td>
                      <Link to={`/events/${event.maSuKien}`} className="event-link" style={{ fontWeight: '500', color: '#000' }}>
                        {event.tenSuKien}
                      </Link>
                    </td>
                    <td>
                      {formatDateTime(event.thoiGianBatDau)}
                      <br />
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>đến</span>
                      <br />
                      {formatDateTime(event.thoiGianKetThuc)}
                    </td>
                    <td>{event.diaDiem}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getEventStatusColor(event) + '20',
                          color: getEventStatusColor(event),
                          border: `1px solid ${getEventStatusColor(event)}40`
                        }}
                      >
                        {getEventStatus(event)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Link to={`/events/${event.maSuKien}`} className="btn-edit" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Events;
