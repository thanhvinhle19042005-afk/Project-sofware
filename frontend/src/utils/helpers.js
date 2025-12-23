export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getEventStatus = (event) => {
  const now = new Date();
  const startDate = new Date(event.thoiGianBatDau);
  const endDate = new Date(event.thoiGianKetThuc);

  if (now < startDate) return 'Sắp diễn ra';
  if (now > endDate) return 'Đã kết thúc';
  return 'Đang diễn ra';
};

export const getEventStatusColor = (event) => {
  const status = getEventStatus(event);
  switch (status) {
    case 'Sắp diễn ra':
      return 'blue';
    case 'Đang diễn ra':
      return 'green';
    case 'Đã kết thúc':
      return 'gray';
    default:
      return 'gray';
  }
};
