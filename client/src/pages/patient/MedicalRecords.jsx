import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/patients/medical-records');
      if (response.data.status === 'success') {
        setRecords(response.data.data.medicalRecords);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch medical records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Medical Records</h1>

      {records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No medical records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <div key={record._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Dr. {record.doctor.name}
                  </h2>
                  <p className="text-gray-600">{record.doctor.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Diagnosis</h3>
                  <p className="text-gray-600 mt-1">{record.diagnosis}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">Prescription</h3>
                  <p className="text-gray-600 mt-1">{record.prescription}</p>
                </div>

                {record.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900">Notes</h3>
                    <p className="text-gray-600 mt-1">{record.notes}</p>
                  </div>
                )}

                {record.attachments && record.attachments.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900">Attachments</h3>
                    <div className="mt-2 space-y-2">
                      {record.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 block"
                        >
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {record.followUpDate && (
                  <div>
                    <h3 className="font-medium text-gray-900">Follow-up Date</h3>
                    <p className="text-gray-600 mt-1">
                      {new Date(record.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords; 