import React from 'react';

const StatusBadge = ({ status, className = "" }) => {
  const statusStyles = {
    available: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    in_use: 'bg-blue-50 text-blue-600 border-blue-200',
    maintenance: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    retired: 'bg-red-50 text-red-600 border-red-200',
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rejected: 'bg-red-50 text-red-600 border-red-200'
  };

  const statusLabels = {
    available: 'พร้อมใช้งาน',
    active: 'พร้อมใช้งาน',
    in_use: 'กำลังใช้งาน',
    maintenance: 'ซ่อมบำรุง',
    retired: 'เลิกใช้งาน',
    pending: 'รออนุมัติ',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-200'} ${className}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;
