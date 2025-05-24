import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';
import { showToast } from '../../utils/toast';
import { motion } from 'framer-motion';

const ConsultationFee = () => {
  const { user } = useAuth();
  const [consultationFee, setConsultationFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConsultationFee();
  }, []);

  const fetchConsultationFee = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/doctors/consultation-fee');
      if (response.data.status === 'success') {
        setConsultationFee(response.data.data.consultationFee);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consultation fee');
      }
    } catch (error) {
      console.error('Error fetching consultation fee:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch consultation fee');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.patch('/api/doctors/consultation-fee', { consultationFee });
      if (response.data.status === 'success') {
        showToast.success('Consultation fee updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update consultation fee');
      }
    } catch (error) {
      console.error('Error updating consultation fee:', error);
      showToast.error(error.response?.data?.message || 'Failed to update consultation fee');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Set Consultation Fee</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee (USD)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="consultationFee"
                    id="consultationFee"
                    min="0"
                    step="0.01"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(parseFloat(e.target.value))}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Set your consultation fee per appointment. This will be charged to patients when they book appointments with you.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConsultationFee; 