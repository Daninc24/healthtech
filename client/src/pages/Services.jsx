import { motion } from 'framer-motion';

const Services = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl lg:mx-0"
          >
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Our Services</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Comprehensive healthcare solutions designed to make your medical journey seamless and efficient.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main services section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Healthcare Solutions</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="h-48 bg-blue-600 flex items-center justify-center">
                  <span className="text-4xl">{service.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="mt-2 text-gray-600">{service.description}</p>
                  <ul className="mt-4 space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <svg
                          className="h-5 w-5 text-blue-600 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional services section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Additional Services</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {additionalServices.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="w-24 bg-blue-600 flex items-center justify-center">
                  <span className="text-3xl">{service.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="mt-2 text-gray-600">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Join our platform today and experience the future of healthcare management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/register"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:scale-105"
            >
              Get started
            </a>
            <a
              href="/contact"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              Contact us <span aria-hidden="true">→</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const mainServices = [
  {
    name: 'Online Consultations',
    description: 'Connect with healthcare professionals from the comfort of your home.',
    icon: '👨‍⚕️',
    features: [
      'Video consultations',
      'Secure messaging',
      '24/7 availability',
      'Prescription delivery',
    ],
  },
  {
    name: 'Appointment Management',
    description: 'Schedule and manage your medical appointments with ease.',
    icon: '📅',
    features: [
      'Real-time scheduling',
      'Automated reminders',
      'Waitlist management',
      'Calendar integration',
    ],
  },
  {
    name: 'Health Records',
    description: 'Access and manage your medical history securely.',
    icon: '📋',
    features: [
      'Digital prescriptions',
      'Test results',
      'Vaccination records',
      'Medical history',
    ],
  },
];

const additionalServices = [
  {
    name: 'Medication Reminders',
    description: 'Never miss a dose with our smart medication reminder system.',
    icon: '💊',
  },
  {
    name: 'Health Monitoring',
    description: 'Track your vital signs and health metrics in real-time.',
    icon: '❤️',
  },
  {
    name: 'Insurance Integration',
    description: 'Seamlessly manage your healthcare insurance claims.',
    icon: '📄',
  },
  {
    name: 'Emergency Support',
    description: '24/7 emergency assistance and support services.',
    icon: '🚑',
  },
];

export default Services; 