import { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../../utils/toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';

const PatientSubscriptions = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/patients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPatients(response.data.data.patients);
    } catch (error) {
      showToast.error('Failed to fetch patients');
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleRenewSubscription = async (patientId) => {
    if (!confirm('Are you sure you want to renew this patient\'s subscription?')) return;
    
    setProcessing(true);
    try {
      await axios.post(
        `http://localhost:5000/api/admin/patients/${patientId}/renew-subscription`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      showToast.success('Subscription renewed successfully');
      fetchPatients();
    } catch (error) {
      showToast.error('Failed to renew subscription');
      console.error('Error renewing subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async (patientId) => {
    if (!confirm('Are you sure you want to cancel this patient\'s subscription?')) return;
    
    setProcessing(true);
    try {
      await axios.post(
        `http://localhost:5000/api/admin/patients/${patientId}/cancel-subscription`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      showToast.success('Subscription cancelled successfully');
      fetchPatients();
    } catch (error) {
      showToast.error('Failed to cancel subscription');
      console.error('Error cancelling subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Patient Subscriptions</CardTitle>
            <CardDescription>Manage patient subscription status and renewals</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patients.map((patient) => (
            <div
              key={patient._id}
              className="flex items-center justify-between p-4 bg-white rounded-lg border"
            >
              <div className="flex-1">
                <h3 className="font-medium">{patient.name}</h3>
                <p className="text-sm text-gray-500">{patient.email}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Subscription Plan:</span>{' '}
                    {patient.subscriptionPlan ? patient.subscriptionPlan.name : 'None'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <Badge className={getSubscriptionStatusColor(patient.subscriptionStatus)}>
                      {patient.subscriptionStatus}
                    </Badge>
                  </p>
                  {patient.subscriptionEndDate && (
                    <p className="text-sm">
                      <span className="font-medium">Expires:</span>{' '}
                      {new Date(patient.subscriptionEndDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {patient.subscriptionStatus === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleCancelSubscription(patient._id)}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                )}
                {patient.subscriptionStatus !== 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRenewSubscription(patient._id)}
                    disabled={processing}
                  >
                    Renew
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSubscriptions; 