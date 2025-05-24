import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  LayoutDashboard,
  UserPlus,
  UserCircle,
  CreditCard,
  Calendar,
  MessageSquare,
  BarChart
} from 'lucide-react';
import { Input } from '../components/ui/input';
import PendingDoctorsList from '../components/admin/PendingDoctorsList';
import { useNavigate } from 'react-router-dom';
import SubscriptionPlans from '../components/admin/SubscriptionPlans';
import PatientSubscriptions from '../components/admin/PatientSubscriptions';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'pending-doctors',
      label: 'Pending Doctors',
      icon: UserPlus
    },
    {
      id: 'approved-doctors',
      label: 'Approved Doctors',
      icon: Users
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: UserCircle
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      icon: CreditCard
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Calendar
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching users with token:', token.substring(0, 20) + '...');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Users response:', response.data);
      const users = response.data.data.users;
      setDoctors(users.filter(user => user.role === 'doctor'));
      setPatients(users.filter(user => user.role === 'patient'));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        console.log('Token is invalid or expired, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to fetch users. Please try again.');
        toast.error('Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerification = async (userId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/verify`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const getVerificationBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'destructive'
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="ml-4 flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out mt-16`}
        >
          <nav className="mt-5 px-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md w-full`}
              >
                <item.icon
                  className={`${
                    activeTab === item.id ? 'text-primary-600' : 'text-gray-400'
                  } mr-4 h-6 w-6`}
                />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } flex-1 p-8 transition-all duration-200 ease-in-out`}
        >
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>
                {/* Dashboard content will go here */}
              </div>
            )}
            {activeTab === 'pending-doctors' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Pending Doctor Approvals</h2>
                <PendingDoctorsList />
              </div>
            )}
            {activeTab === 'approved-doctors' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Approved Doctors</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Approved Doctors</CardTitle>
                    <CardDescription>View and manage approved doctors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {doctors.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No approved doctors found</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Specializations</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctors.map((doctor) => (
                            <TableRow key={doctor._id}>
                              <TableCell>{doctor.name}</TableCell>
                              <TableCell>{doctor.email}</TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {doctor.specializations?.map((spec) => (
                                    <Badge key={spec} variant="secondary">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={doctor.isVerified ? 'success' : 'warning'}>
                                  {doctor.isVerified ? 'Verified' : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === 'patients' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Patient Management</h2>
                <PatientSubscriptions />
              </div>
            )}
            {activeTab === 'subscriptions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Subscription Management</h2>
                <SubscriptionPlans />
              </div>
            )}
            {activeTab === 'appointments' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Appointments</h2>
                {/* Appointments content will go here */}
              </div>
            )}
            {activeTab === 'messages' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h2>
                {/* Messages content will go here */}
              </div>
            )}
            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h2>
                {/* Reports content will go here */}
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h2>
                {/* Settings will go here */}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 