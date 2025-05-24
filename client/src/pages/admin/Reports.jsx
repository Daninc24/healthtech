import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const Reports = () => {
  const [reports, setReports] = useState({
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0,
      userGrowth: 0,
    },
    appointmentStats: {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      averageRating: 0,
    },
    revenueStats: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      averageTransactionValue: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    // TODO: Fetch reports data from the backend
    setReports({
      userStats: {
        totalUsers: 1250,
        activeUsers: 850,
        newUsersThisMonth: 150,
        userGrowth: 12.5,
      },
      appointmentStats: {
        totalAppointments: 3500,
        completedAppointments: 3200,
        cancelledAppointments: 150,
        averageRating: 4.8,
      },
      revenueStats: {
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        revenueGrowth: 8.3,
        averageTransactionValue: 85,
      },
    });
    setLoading(false);
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value}%`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Reports</h1>
        
        <AdminNav />

        <div className="flex justify-end mb-8">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.userStats.totalUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.userStats.activeUsers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">New Users This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.userStats.newUsersThisMonth}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User Growth</p>
                  <p
                    className={`text-2xl font-bold ${
                      reports.userStats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(reports.userStats.userGrowth)}
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.appointmentStats.totalAppointments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.appointmentStats.completedAppointments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cancelled Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.appointmentStats.cancelledAppointments}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reports.appointmentStats.averageRating}/5.0
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reports.revenueStats.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reports.revenueStats.monthlyRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Revenue Growth</p>
                  <p
                    className={`text-2xl font-bold ${
                      reports.revenueStats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatPercentage(reports.revenueStats.revenueGrowth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Transaction Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reports.revenueStats.averageTransactionValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="flex justify-end space-x-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Export as PDF
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Export as CSV
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Reports; 