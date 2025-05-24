import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch subscriptions from the backend
    setSubscriptions([
      {
        id: 1,
        name: 'Basic Plan',
        price: 29.99,
        features: ['Basic Profile', 'Appointment Scheduling', 'Patient Records'],
        activeUsers: 50,
        status: 'active',
      },
      {
        id: 2,
        name: 'Professional Plan',
        price: 49.99,
        features: ['Advanced Profile', 'Video Consultations', 'Digital Prescriptions', 'Analytics'],
        activeUsers: 25,
        status: 'active',
      },
      {
        id: 3,
        name: 'Enterprise Plan',
        price: 99.99,
        features: [
          'Custom Branding',
          'Team Management',
          'API Access',
          'Priority Support',
          'Custom Integrations',
        ],
        activeUsers: 10,
        status: 'active',
      },
    ]);
    setLoading(false);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Plans</h1>
        
        <AdminNav />

        <div className="flex justify-between items-center mb-8">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New Plan
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-sm text-gray-500 mb-4">
                    Active Users: {plan.activeUsers}
                  </div>
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Edit Plan
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                      View Users
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Subscriptions; 