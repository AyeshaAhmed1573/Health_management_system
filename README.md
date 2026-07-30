# Intelligent Healthcare Platform

A comprehensive healthcare management system featuring AI-powered health assistance, doctor consultations, laboratory services, pharmacy management, and patient health tracking.

## 🌟 Features

### AI Health Assistant
- **AI-Powered Chatbot**: Real-time health guidance using Google Gemini AI
- **Symptom Assessment**: AI-powered symptom checking and preliminary health advice
- **Emergency Detection**: Automatic detection of emergency health situations
- **Report Analysis**: AI interpretation of medical reports and lab results
- **Session Management**: Persistent chat sessions with conversation history

### Doctor Consultations
- **Doctor Directory**: Browse and search healthcare professionals by specialty
- **Real-time Chat**: Direct messaging with doctors
- **Appointment Scheduling**: Book and manage appointments
- **Doctor Profiles**: Detailed information about healthcare providers

### Laboratory Services
- **Lab Booking**: Schedule laboratory tests and diagnostics
- **Report Management**: Access and analyze lab reports
- **AI Report Analysis**: Get AI-powered explanations of test results

### Pharmacy Management
- **Medicine Catalog**: Browse available medications
- **Order Management**: Order medicines online
- **Prescription Handling**: Upload and manage prescriptions

### Health Tracking
- **Health Metrics**: Track vital signs and health readings
- **Patient Profiles**: Comprehensive health profile management
- **Notifications**: Health reminders and alerts

## 🏗️ Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Wouter**: Lightweight routing library
- **Lucide React**: Icon library
- **TanStack Query**: Data fetching and state management
- **shadcn/ui**: UI component library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **Google Gemini AI**: AI-powered responses
- **express-rate-limit**: Rate limiting middleware

## 📁 Project Structure

```
health management system/
├── Backend/
│   ├── Controllers/          # Request handlers
│   │   ├── Auth.controller.js
│   │   ├── chatbotController.js
│   │   └── User.controller.js
│   ├── Database/             # Database connection
│   │   └── db.js
│   ├── Middleware/           # Custom middleware
│   │   ├── Auth.middleware.js
│   │   └── rateLimiter.js
│   ├── Models/               # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── chatSessions.js
│   │   ├── Appointment.model.js
│   │   ├── Doctor.model.js
│   │   └── ...
│   ├── Routes/               # API routes
│   │   ├── Auth.routes.js
│   │   ├── chatbotRoutes.js
│   │   └── User.routes.js
│   ├── Services/             # Business logic
│   │   ├── geminiService.js
│   │   └── chatSessionService.js
│   ├── config/               # Configuration files
│   │   ├── gemini.js
│   │   └── systemPrompt.js
│   ├── utils/                # Utility functions
│   │   ├── emergencyDetector.js
│   │   └── validators.js
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment template
│   ├── package.json
│   ├── server.js
│   └── index.js
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── chat/
│   │   │   │   ├── AIChat.jsx
│   │   │   │   └── ChatCenter.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Page components
│   │   │   ├── AIChat.jsx
│   │   │   ├── ChatCenter.jsx
│   │   │   └── ...
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── use-auth.js
│   │   │   ├── use-profiles.js
│   │   │   └── use-toast.js
│   │   ├── services/         # API services
│   │   │   └── chatbotService.js
│   │   ├── lib/              # Utilities
│   │   │   ├── api.js
│   │   │   ├── queryClient.js
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                  # Environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn
- Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "health management system"
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/health_management_system
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:3000
   ```

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the Application**

   **Terminal 1 - Backend**
   ```bash
   cd Backend
   npm start
   ```

   **Terminal 2 - Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

7. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔐 Authentication

The application supports both authenticated and guest users:

### Guest Users
- Can use the AI chatbot without registration
- Sessions are tracked via guest IDs
- Limited access to other features

### Authenticated Users
- Full access to all features
- Persistent chat sessions
- Doctor consultations
- Lab bookings and pharmacy orders
- Health profile management

### Authentication Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

### Chatbot
- `POST /api/chatbot/sessions` - Create new chat session
- `GET /api/chatbot/sessions` - Get user sessions
- `GET /api/chatbot/sessions/:sessionId` - Get session history
- `POST /api/chatbot/sessions/:sessionId/message` - Send message
- `DELETE /api/chatbot/sessions/:sessionId/messages` - Clear messages
- `DELETE /api/chatbot/sessions/:sessionId` - Delete session

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/health-readings` - Get health readings
- `POST /api/users/health-readings` - Add health reading

## 🤖 AI Integration

### Google Gemini AI
The chatbot uses Google Gemini AI for generating health-related responses:

**Features:**
- Context-aware conversations
- Emergency detection
- Medical safety filters
- System prompts for healthcare context

**Configuration:**
- Model: gemini-2.0-flash
- Temperature: 0.7
- Max output tokens: 800
- Safety settings for medical content

**Fallback:**
If GEMINI_API_KEY is not configured, the system uses mock responses for common health queries.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Emergency Detection**: AI-powered emergency health situation detection
- **Safety Filters**: Content safety for AI responses

## 🧪 Testing

### Manual Testing
1. Test guest chatbot functionality
2. Test user registration and login
3. Test chat session creation and management
4. Test AI responses with various health queries
5. Test emergency detection

### API Testing
Use tools like Postman or cURL to test API endpoints:

```bash
# Example: Create chat session
curl -X POST http://localhost:3000/api/chatbot/sessions \
  -H "Content-Type: application/json" \
  -d '{"title": "Health Consultation"}'
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check if port 3000 is available

**Frontend can't connect to backend**
- Verify VITE_API_URL in Frontend/.env
- Check CORS configuration in Backend/server.js
- Ensure backend is running

**AI responses not working**
- Verify GEMINI_API_KEY in Backend/.env
- Check backend logs for API errors
- System will use mock responses if API key is missing

**Authentication errors**
- Verify JWT_SECRET in Backend/.env
- Check token storage in localStorage
- Ensure token is sent in Authorization header

## 📝 Development Notes

### Code Style
- ES6+ JavaScript syntax
- Functional React components
- Async/await for asynchronous operations
- Consistent error handling

### Database Schema
- MongoDB with Mongoose ODM
- Indexed fields for performance
- Timestamps for all documents
- Soft delete pattern for sessions

### API Design
- RESTful conventions
- Consistent response format
- Proper HTTP status codes
- Rate limiting on sensitive endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes.

## 📞 Support

For issues or questions, please refer to the troubleshooting section or contact the development team.

## 🔮 Future Enhancements

- [ ] Real-time video consultations with doctors
- [ ] Integration with health wearables
- [ ] Mobile application (React Native)
- [ ] Advanced AI diagnostics
- [ ] Insurance integration
- [ ] Multi-language support
- [ ] Telemedicine features
- [ ] Health analytics dashboard
