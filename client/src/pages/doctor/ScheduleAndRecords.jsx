import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import { showToast } from '../../utils/toast';
import { FaCalendarAlt, FaClock, FaUser, FaSearch, FaFilter, FaFileMedical } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const ScheduleAndRecords = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedDate, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, recordsRes] = await Promise.all([
        axios.get(`/api/doctors/appointments?date=${selectedDate.toISOString()}&status=${filterStatus}`),
        axios.get('/api/doctors/all-medical-records')
      ]);

      if (appointmentsRes.data.status === 'success') {
        setAppointments(appointmentsRes.data.data.appointments);
      }
      if (recordsRes.data.status === 'success') {
        setMedicalRecords(recordsRes.data.data.records);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const filteredRecords = medicalRecords.filter(record => {
    const matchesSearch = record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule & Medical Records</h1>
          <p className="mt-2 text-gray-600">View your appointments and patient medical records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Schedule</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                className="w-full border-none"
              />
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No appointments for this date</p>
              ) : (
                appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patient.name}</h3>
                        <p className="text-sm text-gray-500">{appointment.patient.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      {appointment.time}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Medical Records Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Medical Records</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No medical records found</p>
              ) : (
                filteredRecords.map((record) => (
                  <div
                    key={record.patient.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handlePatientSelect(record.patient)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{record.patient.name}</h3>
                        <p className="text-sm text-gray-500">{record.patient.email}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {record.records.length} records
                      </span>
                    </div>
                    {selectedPatient?.id === record.patient.id && (
                      <div className="mt-4 space-y-3">
                        {record.records.map((medicalRecord) => (
                          <div key={medicalRecord.id} className="bg-gray-50 rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{medicalRecord.diagnosis}</p>
                                <p className="text-sm text-gray-600 mt-1">{medicalRecord.prescription}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(medicalRecord.date).toLocaleDateString()}
                              </span>
                            </div>
                            {medicalRecord.notes && (
                              <p className="text-sm text-gray-600 mt-2">{medicalRecord.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleAndRecords; 