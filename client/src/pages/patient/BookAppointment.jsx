import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/doctors/${doctorId}`);
      setDoctor(response.data.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to fetch doctor details');
      navigate('/patient/doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`/api/doctors/available-slots/${doctorId}?date=${selectedDate}`);
      setAvailableSlots(response.data.data.slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available slots');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setBooking(true);
      const response = await axios.post('/api/appointments', {
        doctor: doctorId,
        date: selectedDate,
        time: selectedTime,
        reason,
        type: 'consultation'
      });

      if (response.data.status === 'success') {
        toast.success('Appointment booked successfully!');
        navigate('/patient/appointments');
      } else {
        throw new Error(response.data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>

        {/* Doctor Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
              {doctor?.name.charAt(0)}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{doctor?.name}</h2>
              <p className="text-gray-600">{doctor?.specialty}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Consultation Fee:</span> ${doctor?.consultationFee}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Rating:</span> {doctor?.averageRating?.toFixed(1) || 'N/A'} ({doctor?.totalRatings || 0} reviews)
            </p>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedDate || availableSlots.length === 0}
              >
                <option value="">Select a time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {selectedDate && availableSlots.length === 0 && (
                <p className="mt-2 text-sm text-red-600">No available slots for this date</p>
              )}
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe your symptoms or reason for visit"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={booking}
                className={`bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors ${
                  booking ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment; 