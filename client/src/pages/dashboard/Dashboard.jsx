import { useState } from "react"

export default function Dashboard() {
  const [stats] = useState({
    appointments: 12,
    reminders: 8,
    patients: 156,
  })

  const [recentActivity] = useState([
    {
      id: 1,
      type: "appointment",
      title: "New Appointment Scheduled",
      description: "Dr. Smith - Annual Checkup",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "reminder",
      title: "Reminder Sent",
      description: "Medication reminder for John Doe",
      time: "3 hours ago",
    },
    {
      id: 3,
      type: "patient",
      title: "New Patient Registered",
      description: "Jane Smith",
      time: "5 hours ago",
    },
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Appointments Card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
            <div className="relative bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Appointments</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.appointments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reminders Card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
            <div className="relative bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-secondary/10">
                  <svg
                    className="w-6 h-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Reminders</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.reminders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Patients Card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
            <div className="relative bg-white rounded-lg p-6 shadow-xl">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-gray-900">Patients</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.patients}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg"></div>
          <div className="relative bg-white rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-full bg-primary/10">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 