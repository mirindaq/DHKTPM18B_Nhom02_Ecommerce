import React from 'react';

const StaffDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Đơn hàng mới</h3>
          <p className="text-3xl font-bold text-blue-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Sản phẩm</h3>
          <p className="text-3xl font-bold text-green-600">156</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Khách hàng</h3>
          <p className="text-3xl font-bold text-purple-600">89</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Doanh thu hôm nay</h3>
          <p className="text-3xl font-bold text-orange-600">5,200,000đ</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
