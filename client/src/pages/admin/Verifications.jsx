import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import AdminNav from '../../components/AdminNav';

const Verifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch verifications from the backend
    setVerifications([
      {
        id: 1,
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Pediatrics',
        email: 'sarah.johnson@example.com',
        submittedDate: '2024-01-15',
        documents: ['Medical License', 'ID Card', 'Specialization Certificate'],
        status: 'pending',
      },
      {
        id: 2,
        doctorName: 'Dr. Michael Brown',
        specialty: 'Neurology',
        email: 'michael.brown@example.com',
        submittedDate: '2024-01-18',
        documents: ['Medical License', 'ID Card', 'Specialization Certificate'],
        status: 'pending',
      },
    ]);
    setLoading(false);
  }, []);

  const handleVerification = (id, action) => {
    // TODO: Implement verification action (approve/reject)
    console.log(`Verification ${action} for ID: ${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Verifications</h1>
        
        <AdminNav />

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {verifications.map((verification) => (
              <motion.div
                key={verification.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{verification.doctorName}</h3>
                    <p className="text-sm text-gray-500">{verification.specialty}</p>
                    <p className="text-sm text-gray-500">{verification.email}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      verification.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {verification.status}
                  </span>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Documents:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {verification.documents.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-end space-x-4">
                  <button
                    onClick={() => handleVerification(verification.id, 'approve')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerification(verification.id, 'reject')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    View Documents
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Verifications; 