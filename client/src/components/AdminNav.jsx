import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminNav = () => {
  const location = useLocation();
  
  const navItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { title: 'Doctors', path: '/admin/doctors', icon: '👨‍⚕️' },
    { title: 'Patients', path: '/admin/patients', icon: '👥' },
    { title: 'Verifications', path: '/admin/verifications', icon: '✓' },
    { title: 'Subscriptions', path: '/admin/subscriptions', icon: '💳' },
    { title: 'Settings', path: '/admin/settings', icon: '⚙️' },
    { title: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 mb-6 sticky top-4 z-50">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <motion.div
            key={item.path}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={item.path}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminNav; 