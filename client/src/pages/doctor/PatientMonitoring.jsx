import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const PatientMonitoring = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/doctor/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patientId) => {
    try {
      const response = await axios.get(`/api/doctor/patients/${patientId}`);
      setSelectedPatient(response.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }
  };

  const handleScheduleFollowUp = async () => {
    if (!selectedPatient || !followUpDate || !followUpNotes) return;

    try {
      await axios.post(`/api/doctor/patients/${selectedPatient.id}/follow-up`, {
        date: followUpDate,
        notes: followUpNotes,
      });
      setShowFollowUpModal(false);
      setFollowUpDate('');
      setFollowUpNotes('');
      handlePatientSelect(selectedPatient.id);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
    }
  };

  const handleUpdatePatientNotes = async (patientId, notes) => {
    try {
      await axios.put(`/api/doctor/patients/${patientId}/notes`, { notes });
      handlePatientSelect(patientId);
    } catch (error) {
      console.error('Error updating patient notes:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Patient Monitoring</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Patients</h2>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.email}</div>
                      <div className="text-sm text-gray-500">
                        Last Visit: {patient.lastVisit}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-gray-500">{selectedPatient.email}</p>
                  </div>
                  <button
                    onClick={() => setShowFollowUpModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule Follow-up
                  </button>
                </div>

                {/* Medical History */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical History</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedPatient.medicalHistory}</p>
                  </div>
                </div>

                {/* Recent Visits */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Visits</h3>
                  <div className="space-y-4">
                    {selectedPatient.visits.map((visit) => (
                      <div key={visit.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{visit.date}</p>
                            <p className="text-sm text-gray-500">{visit.type}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              visit.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {visit.status}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700">{visit.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-ups */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Scheduled Follow-ups</h3>
                  <div className="space-y-4">
                    {selectedPatient.followUps.map((followUp) => (
                      <div key={followUp.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{followUp.date}</p>
                            <p className="text-sm text-gray-500">{followUp.type}</p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              followUp.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {followUp.status}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700">{followUp.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-500">Select a patient to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Modal */}
        {showFollowUpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Schedule Follow-up</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows="4"
                    placeholder="Enter follow-up notes..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowFollowUpModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleFollowUp}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PatientMonitoring; 