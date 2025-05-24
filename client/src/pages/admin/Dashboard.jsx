import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import AdminNav from '../../components/AdminNav';
import showToast from '../../utils/toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    pendingVerifications: 0,
    activeSubscriptions: 0,
    totalAppointments: 0,
    totalRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/admin/dashboard-stats');
        if (response.data.status === 'success') {
          setStats(response.data.data.stats);
          setRecentActivity(response.data.data.recentActivity);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Manage Doctors',
      description: 'View and manage doctor accounts',
      icon: '👨‍⚕️',
      link: '/admin/doctors',
    },
    {
      title: 'Manage Patients',
      description: 'View and manage patient accounts',
      icon: '👥',
      link: '/admin/patients',
    },
    {
      title: 'Verifications',
      description: 'Handle doctor verifications',
      icon: '✓',
      link: '/admin/verifications',
    },
    {
      title: 'Subscriptions',
      description: 'Manage subscription plans',
      icon: '💳',
      link: '/admin/subscriptions',
    },
    {
      title: 'Settings',
      description: 'Configure system settings',
      icon: '⚙️',
      link: '/admin/settings',
    },
    {
      title: 'Reports',
      description: 'View system reports',
      icon: '📊',
      link: '/admin/reports',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <AdminNav />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Doctors</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalDoctors}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Patients</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Verifications</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.pendingVerifications}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Subscriptions</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Appointments</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-blue-600">${stats.totalRevenue}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{action.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
              </div>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard; 