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
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await suKienAPI.getAll();
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
    if (filter === 'all') return true;
    const status = getEventStatus(event);
    if (filter === 'upcoming') return status === 'Sắp diễn ra' || status === 'Đang diễn ra';
    if (filter === 'past') return status === 'Đã kết thúc';
    if (filter === 'cancelled') return event.trangThai === 'Hủy bỏ';
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

        <div className="toolbar">
          <div className="filter-group" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tất cả
            </button>
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              Sắp diễn ra
            </button>
            <button
              className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
              onClick={() => setFilter('past')}
            >
              Đã kết thúc
            </button>
            <button
              className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setFilter('cancelled')}
            >
              Đã hủy
            </button>
          </div>
          
          {isAdmin() && (
            <Link to="/events/create" className="btn-add">
              + Tạo sự kiện mới
            </Link>
          )}
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
