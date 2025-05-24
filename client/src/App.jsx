import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import 'react-toastify/dist/ReactToastify.css';
import { Suspense } from 'react';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/doctor/Dashboard';
import Appointments from './pages/doctor/Appointments';
import ConsultationFee from './pages/doctor/ConsultationFee';
import Patients from './pages/doctor/Patients';
import MedicalRecords from './pages/doctor/MedicalRecords';
import PatientMonitoring from './pages/doctor/PatientMonitoring';
import ScheduleAndRecords from './pages/doctor/ScheduleAndRecords';
import PatientDashboard from './pages/patient/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';
import FindDoctors from './pages/FindDoctors';
import Services from './pages/Services';
import About from './pages/About';
import BookAppointment from './pages/BookAppointment';

// Admin Components
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminVerifications from './pages/admin/Verifications';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';
import PendingAccounts from './pages/admin/PendingAccounts';

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-doctors" element={<FindDoctors />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />

            {/* Protected routes */}
            <Route
              path="/book-appointment"
              element={
                <PrivateRoute role="patient">
                  <BookAppointment />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <PrivateRoute role="doctor">
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <PrivateRoute role="doctor">
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/consultation-fee"
              element={
                <PrivateRoute role="doctor">
                  <ConsultationFee />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <PrivateRoute role="doctor">
                  <Patients />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/medical-records"
              element={
                <PrivateRoute role="doctor">
                  <MedicalRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/schedule-records"
              element={
                <PrivateRoute role="doctor">
                  <ScheduleAndRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/patient-monitoring"
              element={
                <PrivateRoute role="doctor">
                  <PatientMonitoring />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/dashboard/*"
              element={
                <PrivateRoute role="patient">
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <PrivateRoute role="admin">
                  <AdminDoctors />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/patients"
              element={
                <PrivateRoute role="admin">
                  <AdminPatients />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <PrivateRoute role="admin">
                  <AdminVerifications />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/subscriptions"
              element={
                <PrivateRoute role="admin">
                  <AdminSubscriptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute role="admin">
                  <AdminSettings />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute role="admin">
                  <AdminReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/pending-accounts"
              element={
                <PrivateRoute role="admin">
                  <PendingAccounts />
                </PrivateRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App; 