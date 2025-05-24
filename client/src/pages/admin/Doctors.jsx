import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { showToast } from '../../utils/toast';
import AdminNav from '../../components/AdminNav';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get('/api/admin/doctors');
      console.log('Doctors response:', response.data);
      if (response.data.status === 'success') {
        setDoctors(response.data.data.doctors);
      } else {
        throw new Error(response.data.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doctorId) => {
    try {
      const response = await axios.delete(`/api/admin/users/${doctorId}`);
      if (response.data.status === 'success') {
        showToast.success('Doctor deleted successfully');
        setShowDeleteModal(false);
        setSelectedDoctor(null);
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error deleting doctor:', error);
      showToast.error('Failed to delete doctor');
    }
  };

  const handleDeactivate = async (doctorId) => {
    try {
      const response = await axios.patch(`/api/admin/users/${doctorId}/status`, {
        isActive: false
      });
      if (response.data.status === 'success') {
        showToast.success('Doctor deactivated successfully');
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error deactivating doctor:', error);
      showToast.error(error.response?.data?.message || 'Failed to deactivate doctor');
    }
  };

  const handleVerify = async (doctorId, status) => {
    try {
      const response = await axios.patch(`/api/admin/users/${doctorId}/approve`, {
        status,
        reason: status === 'rejected' ? verificationNotes : undefined
      });
      
      if (response.data.status === 'success') {
        showToast.success(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        setShowVerifyModal(false);
        setSelectedDoctor(null);
        setVerificationNotes('');
        fetchDoctors();
      }
    } catch (error) {
      console.error('Error verifying doctor:', error);
      showToast.error(error.response?.data?.message || 'Failed to verify doctor');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Doctors</h1>
        </div>

        <AdminNav />

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{doctor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {doctor.specializations?.join(', ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doctor.verificationStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : doctor.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {doctor.verificationStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {doctor.verificationStatus === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor);
                            setShowVerifyModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        onClick={() => handleDeactivate(doctor._id)}
                        className={`text-${doctor.isActive ? 'yellow' : 'green'}-600 hover:text-${
                          doctor.isActive ? 'yellow' : 'green'
                        }-900 mr-4`}
                      >
                        {doctor.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Doctor
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedDoctor.name}'s account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDoctor(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedDoctor._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Verify Doctor
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Enter verification notes..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedDoctor(null);
                  setVerificationNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(selectedDoctor._id, 'rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
              >
                Reject
              </button>
              <button
                onClick={() => handleVerify(selectedDoctor._id, 'approved')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors; 