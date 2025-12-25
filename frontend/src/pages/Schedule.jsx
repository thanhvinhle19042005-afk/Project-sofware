import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { suKienAPI } from '../api';
import { formatDateTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import './Schedule.css';

const Schedule = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      let response;
      if (isAdmin()) {
        // Admin sees all events
        response = await suKienAPI.getAll();
      } else {
        // Residents only see joined events
        response = await suKienAPI.getJoined();
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

  // Calendar Logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const daysArray = [];

  // Previous month filler
  for (let i = 0; i < firstDay; i++) {
    daysArray.push({ type: 'prev', day: '' });
  }

  // Current month days
  for (let i = 1; i <= days; i++) {
    const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    currentDayDate.setHours(0, 0, 0, 0);

    const dayEvents = events.filter(e => {
      const startDate = new Date(e.thoiGianBatDau);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(e.thoiGianKetThuc);
      endDate.setHours(0, 0, 0, 0);

      return currentDayDate >= startDate && currentDayDate <= endDate;
    });

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    daysArray.push({ type: 'current', day: i, date: dateStr, events: dayEvents });
  }

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // Filter events for the selected date
  const selectedDateEvents = events.filter(e => {
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);

    const startDate = new Date(e.thoiGianBatDau);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(e.thoiGianKetThuc);
    endDate.setHours(0, 0, 0, 0);

    return checkDate >= startDate && checkDate <= endDate;
  }).sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTimeFull = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isSelectedDate = (day, currentMonthDate) => {
    return day === selectedDate.getDate() &&
           currentMonthDate.getMonth() === selectedDate.getMonth() &&
           currentMonthDate.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Lịch Biểu Hoạt Động</h1>
        </div>

        <div className="schedule-page">
          {/* Left: Calendar */}
          <div className="calendar-section">
            <div className="calendar-header">
              <button onClick={() => changeMonth(-1)}>&lt; Tháng trước</button>
              <h2 style={{ margin: 0 }}>
                Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}
              </h2>
              <button onClick={() => changeMonth(1)}>Tháng sau &gt;</button>
            </div>

            <div className="calendar-grid">
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}
              
              {daysArray.map((item, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${item.type === 'prev' ? 'other-month' : ''} ${
                    item.type === 'current' && 
                    item.day === new Date().getDate() && 
                    currentDate.getMonth() === new Date().getMonth() && 
                    currentDate.getFullYear() === new Date().getFullYear() 
                    ? 'today' : ''
                  } ${item.type === 'current' && isSelectedDate(item.day, currentDate) ? 'selected' : ''}`}
                  onClick={() => {
                    if (item.type === 'current') {
                      setSelectedDate(new Date(item.date));
                    }
                  }}
                >
                  {item.type === 'current' && (
                    <>
                      <span className="day-number">{item.day}</span>
                      {item.events.length > 0 && (
                        <div className="event-dot"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Date Events Table */}
          <div className="upcoming-section">
            <h3 className="section-title">
              Sự kiện ngày {selectedDate.toLocaleDateString('vi-VN')}
            </h3>
            {selectedDateEvents.length === 0 ? (
              <div className="empty-state">Không có sự kiện nào trong ngày này</div>
            ) : (
              <div className="table-container" style={{ boxShadow: 'none', padding: 0 }}>
                <table className="upcoming-table">
                  <thead>
                    <tr>
                      <th>Thời gian</th>
                      <th>Sự kiện</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDateEvents.map(event => (
                      <tr key={event.maSuKien}>
                        <td>
                          <div className="event-time">
                            {formatTime(event.thoiGianBatDau)}
                            <br/>
                            <span style={{color: '#666', fontSize: '0.9em'}}>
                              - {formatDateTimeFull(event.thoiGianKetThuc)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="event-name">{event.tenSuKien}</div>
                          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                            {event.diaDiem}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
