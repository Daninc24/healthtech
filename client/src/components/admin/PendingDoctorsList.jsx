import { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Check, X } from 'lucide-react';

const PendingDoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching pending doctors with token:', token.substring(0, 20) + '...');
      const response = await axios.get('/api/admin/pending-doctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status === 'success') {
        setDoctors(response.data.data.doctors);
      } else {
        throw new Error(response.data.message || 'Failed to fetch pending doctors');
      }
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch pending doctors');
      if (error.response?.status === 401) {
        console.log('Token is invalid or expired, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const handleApproval = async (doctorId, approved) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `/api/admin/doctors/${doctorId}/approve`,
        { approved },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        showToast.success(approved ? 'Doctor approved successfully' : 'Doctor rejected');
        fetchPendingDoctors(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to process doctor verification');
      }
    } catch (error) {
      console.error('Error processing doctor verification:', error);
      showToast.error(error.response?.data?.message || 'Failed to process doctor verification');
      if (error.response?.status === 401) {
        console.log('Token is invalid or expired, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Doctor Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No pending doctor approvals</p>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{doctor.name}</h3>
                  <p className="text-sm text-gray-500">{doctor.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {doctor.specializations?.map((spec) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApproval(doctor._id, false)}
                    disabled={processing}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApproval(doctor._id, true)}
                    disabled={processing}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingDoctorsList; 