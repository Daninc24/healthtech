import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { showToast } from '../../utils/toast';
import AdminNav from '../../components/AdminNav';

const PendingAccounts = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingAccounts();
  }, []);

  const fetchPendingAccounts = async () => {
    try {
      const response = await axios.get('/api/admin/pending-accounts');
      if (response.data.status === 'success') {
        setPendingAccounts(response.data.data.accounts);
      } else {
        throw new Error(response.data.message || 'Failed to fetch pending accounts');
      }
    } catch (error) {
      console.error('Error fetching pending accounts:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch pending accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (accountId) => {
    try {
      const response = await axios.patch(`/api/admin/accounts/${accountId}/approve`);
      if (response.data.status === 'success') {
        showToast.success('Account approved successfully');
        fetchPendingAccounts();
      }
    } catch (error) {
      console.error('Error approving account:', error);
      showToast.error(error.response?.data?.message || 'Failed to approve account');
    }
  };

  const handleReject = async (accountId) => {
    try {
      const response = await axios.patch(`/api/admin/accounts/${accountId}/reject`);
      if (response.data.status === 'success') {
        showToast.success('Account rejected successfully');
        fetchPendingAccounts();
      }
    } catch (error) {
      console.error('Error rejecting account:', error);
      showToast.error(error.response?.data?.message || 'Failed to reject account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Pending Accounts</h1>
      
      <AdminNav />

      {pendingAccounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <p className="text-gray-600">No pending accounts to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAccounts.map((account) => (
            <div key={account._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  account.role === 'doctor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {account.role}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {account.email}
                </p>
                {account.role === 'doctor' && account.specializations && (
                  <p className="text-gray-600">
                    <span className="font-medium">Specializations:</span>{' '}
                    {account.specializations.join(', ')}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Registered:</span>{' '}
                  {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleApprove(account._id)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedAccount(account)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Account
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedAccount.name}'s account.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows="4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setSelectedAccount(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedAccount._id)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingAccounts; 