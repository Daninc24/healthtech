# HealthTech Follow-Up Reminder System

[HEALTHTECH PITCH DECK](https://www.canva.com/design/DAGoeWVFqZI/1OkefOrlBKvN6VnAcdFGzw/edit?utm_content=DAGoeWVFqZI&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

A comprehensive healthcare appointment management and reminder system built with modern web technologies.

## 🌟 Features

- Multi-role support (Admin, Doctor, Patient)
- Secure authentication with Magic Links and 2FA
- Appointment scheduling and management
- Automated reminders via Email, SMS, and WhatsApp
- Progressive Web App (PWA) support
- Mobile-first responsive design

## 🏗️ Project Structure

```
healthtech/
├── client/           # React + Vite frontend
├── server/           # Express + MongoDB backend
├── .github/          # GitHub Actions workflows
└── docs/            # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/healthtech.git
cd healthtech
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# In server directory
cp .env.example .env
# Edit .env with your configuration

# In client directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers:
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- ShadCN/Radix UI
- React Query
- Framer Motion

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Agenda.js (Scheduling)
- Redis (Caching)

## 📝 License

MIT License - see LICENSE file for details 
