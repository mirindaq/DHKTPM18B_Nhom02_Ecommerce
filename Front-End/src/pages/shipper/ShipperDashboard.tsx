import React from 'react';

const ShipperDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Shipper Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Đơn hàng cần giao</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Đơn hàng đã giao</h3>
          <p className="text-3xl font-bold text-green-600">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Tổng thu nhập</h3>
          <p className="text-3xl font-bold text-purple-600">2,500,000đ</p>
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;
