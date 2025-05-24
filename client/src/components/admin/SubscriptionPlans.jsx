import { useState, useEffect } from 'react';
import { showToast } from '../../utils/toast';
import axios from '../../utils/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: ''
  });

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/admin/subscription-plans');
      if (response.data.status === 'success') {
        setPlans(response.data.data.plans);
      } else {
        throw new Error(response.data.message || 'Failed to fetch subscription plans');
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      showToast.error(error.response?.data?.message || 'Failed to fetch subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingPlan) {
        await axios.patch(
          `http://localhost:5000/api/admin/subscriptions/${editingPlan._id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        showToast.success('Subscription plan updated successfully');
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/subscriptions',
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        showToast.success('Subscription plan created successfully');
      }
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        features: ''
      });
      fetchPlans();
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      showToast.error(error.response?.data?.message || 'Failed to save subscription plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      features: plan.features.join('\n')
    });
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this subscription plan?')) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/subscriptions/${planId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      showToast.success('Subscription plan deleted successfully');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      showToast.error(error.response?.data?.message || 'Failed to delete subscription plan');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</CardTitle>
          <CardDescription>
            {editingPlan ? 'Update the subscription plan details' : 'Add a new subscription plan to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {editingPlan && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingPlan(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      duration: '',
                      features: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Manage existing subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                  <div className="mt-2">
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> ${plan.price}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Duration:</span> {plan.duration} days
                    </p>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <ul className="text-sm text-gray-500 list-disc list-inside">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(plan._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPlans; 