import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { showToast } from '../../utils/toast';
import { FaCalendarAlt, FaClock, FaUser, FaStethoscope, FaMoneyBillWave, FaCheck, FaTimes, FaCalendarPlus, FaFilter } from 'react-icons/fa';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [consultationFee, setConsultationFee] = useState(0);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    date: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchConsultationFee();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.date) queryParams.append('date', filters.date);

      const response = await axios.get(`/api/doctors/appointments?${queryParams.toString()}`);
      if (response.data.status === 'success') {
        setAppointments(response.data.data.appointments);
      } else {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultationFee = async () => {
    try {
      const response = await axios.get('/api/doctors/consultation-fee');
      setConsultationFee(response.data.data.consultationFee);
    } catch (error) {
      console.error('Error fetching consultation fee:', error);
    }
  };

  const handleUpdateFee = async (newFee) => {
    try {
      await axios.put('/api/doctors/consultation-fee', { consultationFee: newFee });
      setConsultationFee(newFee);
      setShowFeeModal(false);
    } catch (error) {
      console.error('Error updating consultation fee:', error);
    }
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    try {
      const response = await axios.get(`/api/doctors/available-slots?date=${date}`);
      setAvailableSlots(response.data.data.slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const response = await axios.patch(`/api/doctors/appointments/${appointmentId}`, {
        status
      });
      if (response.data.status === 'success') {
        showToast.success('Appointment status updated successfully');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showToast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleFollowUp = async (appointment) => {
    setSelectedAppointment(appointment);
    setShowFollowUpModal(true);
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/doctors/appointments/follow-up', {
        appointmentId: selectedAppointment._id,
        date: followUpDate,
        time: followUpTime,
        reason: followUpReason
      });

      if (response.data.status === 'success') {
        showToast.success('Follow-up appointment scheduled successfully');
        setShowFollowUpModal(false);
        setFollowUpDate('');
        setFollowUpTime('');
        setFollowUpReason('');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      showToast.error(error.response?.data?.message || 'Failed to schedule follow-up appointment');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowFeeModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Update Consultation Fee
            </button>
            <div className="bg-green-100 px-4 py-2 rounded-lg">
              <span className="text-green-800 font-semibold">
                Current Fee: ${consultationFee}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="initial">Initial Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Appointments Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Appointments</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaUser className="text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {appointment.patient.name}
                              </div>
                              <div className="text-sm text-gray-500">{appointment.patient.email}</div>
                              <div className="text-sm text-gray-500">{appointment.patient.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm text-gray-900">
                                {new Date(appointment.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                <FaClock className="inline mr-1" />
                                {appointment.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {appointment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {appointment.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {appointment.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                className="text-green-600 hover:text-green-900 mr-4"
                              >
                                <FaCheck className="inline mr-1" />
                                Complete
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTimes className="inline mr-1" />
                                Cancel
                              </button>
                            </div>
                          )}
                          {appointment.status === 'completed' && (
                            <button
                              onClick={() => handleFollowUp(appointment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaCalendarPlus className="inline mr-1" />
                              Follow-up
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Available Slots */}
            {selectedDate && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Slots</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Consultation Fee Modal */}
        {showFeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Consultation Fee</h3>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                placeholder="Enter new fee"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowFeeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateFee(consultationFee)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Follow-up Modal */}
        {showFollowUpModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Follow-up
                </h3>
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFollowUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason for Follow-up</label>
                  <textarea
                    value={followUpReason}
                    onChange={(e) => setFollowUpReason(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFollowUpModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Appointments; 