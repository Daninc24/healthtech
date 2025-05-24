import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUserMd, FaCalendarCheck, FaVideo, FaFileMedical, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const LandingPage = () => {
  const features = [
    {
      icon: <FaUserMd className="w-8 h-8" />,
      title: 'Expert Doctors',
      description: 'Connect with qualified and verified healthcare professionals'
    },
    {
      icon: <FaCalendarCheck className="w-8 h-8" />,
      title: 'Easy Scheduling',
      description: 'Book appointments with just a few clicks'
    },
    {
      icon: <FaVideo className="w-8 h-8" />,
      title: 'Virtual Consultations',
      description: 'Get medical advice from the comfort of your home'
    },
    {
      icon: <FaFileMedical className="w-8 h-8" />,
      title: 'Digital Records',
      description: 'Access your medical history anytime, anywhere'
    }
  ];

  const services = [
    {
      title: 'Primary Care',
      description: 'Comprehensive healthcare services for individuals and families',
      icon: <FaUserMd className="w-12 h-12" />
    },
    {
      title: 'Specialist Consultations',
      description: 'Expert consultations with specialists in various fields',
      icon: <FaUserMd className="w-12 h-12" />
    },
    {
      title: 'Telemedicine',
      description: 'Virtual consultations for non-emergency medical issues',
      icon: <FaVideo className="w-12 h-12" />
    },
    {
      title: 'Health Monitoring',
      description: 'Track and monitor your health metrics over time',
      icon: <FaChartLine className="w-12 h-12" />
    },
    {
      title: 'Medical Records',
      description: 'Secure storage and easy access to your medical history',
      icon: <FaFileMedical className="w-12 h-12" />
    },
    {
      title: 'Health Insurance',
      description: 'Integration with major health insurance providers',
      icon: <FaShieldAlt className="w-12 h-12" />
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: 'Free',
      features: [
        'Basic health profile',
        'Limited doctor consultations',
        'Basic medical records',
        'Email support'
      ],
      recommended: false
    },
    {
      name: 'Premium',
      price: '$29.99',
      period: '/month',
      features: [
        'Unlimited doctor consultations',
        'Priority scheduling',
        'Comprehensive medical records',
        '24/7 support',
        'Health monitoring tools',
        'Insurance integration'
      ],
      recommended: true
    },
    {
      name: 'Family',
      price: '$49.99',
      period: '/month',
      features: [
        'All Premium features',
        'Up to 5 family members',
        'Family health dashboard',
        'Group appointment scheduling',
        'Family health reports',
        'Dedicated family support'
      ],
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Connect with expert doctors, manage your health records, and get the care you deserve - all in one place.
              </p>
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/find-doctors"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Find Doctors
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <img
                src="/images/hero-image.svg"
                alt="Healthcare"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to making healthcare accessible and convenient for everyone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive healthcare solutions for you and your family
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-blue-600 mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Flexible subscription plans to meet your healthcare needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                  plan.recommended ? 'border-2 border-blue-600' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="bg-blue-600 text-white text-center py-1 px-4 rounded-full text-sm font-semibold mb-4">
                    Recommended
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust us with their healthcare needs
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 