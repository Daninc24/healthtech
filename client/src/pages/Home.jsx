import { Link } from 'react-router-dom';
import { Calendar, Bell, Shield, Users } from 'lucide-react';

const features = [
  {
    name: 'Smart Scheduling',
    description: 'Efficiently manage appointments with our intelligent scheduling system.',
    icon: Calendar,
  },
  {
    name: 'Automated Reminders',
    description: 'Never miss an appointment with automated reminders via email, SMS, and WhatsApp.',
    icon: Bell,
  },
  {
    name: 'Secure Platform',
    description: 'Your data is protected with enterprise-grade security and encryption.',
    icon: Shield,
  },
  {
    name: 'Multi-User Support',
    description: 'Support for doctors, patients, and administrators with role-based access.',
    icon: Users,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Welcome to</span>
                  <span className="block gradient-text">HealthTech</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Your comprehensive healthcare management solution. Streamline appointments, manage patient records, and enhance your healthcare practice with our modern platform.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/login"
                      className="button-primary w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="button-secondary w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base gradient-text font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage your healthcare practice
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
                <div className="relative bg-white rounded-lg p-6 shadow-xl">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Appointment Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Schedule and manage appointments efficiently with our intuitive calendar system.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
                <div className="relative bg-white rounded-lg p-6 shadow-xl">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Records</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Securely store and access patient information with our comprehensive record management system.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
                <div className="relative bg-white rounded-lg p-6 shadow-xl">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Telemedicine</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Conduct virtual consultations with integrated video calling and secure messaging.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative">
                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
                <div className="relative bg-white rounded-lg p-6 shadow-xl">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics Dashboard</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get insights into your practice with detailed analytics and reporting tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 