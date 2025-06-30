# Zenny - Creator-Editor Collaboration Platform

A web-based platform that enables creators to discover and collaborate with editors for video editing services via Telegram-based interaction. The platform maintains anonymous identities for both parties, ensuring secure, admin-monitored communication.

## 🏗️ Project Structure

```
Zenny/
├── Frontend/                 # React + Vite frontend (Public Website)
├── Backend/                  # Express.js API server (Admin Panel)
├── telegram-bot/            # Telegram bot for anonymous chat
├── shared-db/               # Shared MongoDB models
├── shared-utils/            # Shared utilities and constants
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Telegram Bot Token
- Razorpay Account
- Cloudinary Account

### Environment Setup

1. **Backend Environment Variables**
   Create `.env` file in `Backend/` directory:

   ```env
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/zenny_platform
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   REDIS_URL=redis://localhost:6379
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_ADMIN_GROUP_ID=your_admin_group_id
   ```

2. **Telegram Bot Environment Variables**
   Create `.env` file in `telegram-bot/` directory:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   MONGO_URI=mongodb://localhost:27017/zenny_platform
   REDIS_URL=redis://localhost:6379
   ```

### Installation & Running

1. **Install Dependencies**

   ```bash
   # Frontend
   cd Frontend && npm install

   # Backend
   cd Backend && npm install

   # Telegram Bot
   cd telegram-bot && npm install

   # Shared modules
   cd shared-db && npm install
   ```

2. **Start Services**

   ```bash
   # Terminal 1: Frontend
   cd Frontend && npm run dev

   # Terminal 2: Backend
   cd Backend && npm run dev

   # Terminal 3: Telegram Bot
   cd telegram-bot && npm run dev
   ```

## 📋 Features

### Frontend (Public Website)

- Landing page with CTA
- About Us page
- Editor portfolio browsing with filters
- Support form
- Editor registration form
- FAQs page
- Terms & Conditions + Privacy Policy

### Backend (Admin Panel)

- Secure admin authentication
- Editor management (CRUD operations)
- Support ticket system
- Dispute & moderation panel
- Payment tracking
- Feedback management

### Telegram Bot

- Anonymous chat between creators and editors
- Admin oversight of all communications
- Payment link generation
- Chat freeze/end functionality
- Watermark video sharing

## 🔄 User Journey

1. **Creator Journey:**

   - Browse editor portfolios on website
   - Click "Chat with Editor" or "Book Editor"
   - Select service type and proceed to payment
   - Join anonymous Telegram group chat
   - Share watermark video
   - Make payment through website
   - Receive final video via Telegram
   - Provide feedback

2. **Editor Journey:**

   - Admin creates editor profile
   - Editor receives Telegram invite
   - Editor joins anonymous group chats
   - Editor receives watermark videos
   - Editor delivers final videos
   - Editor can contact admin for support

3. **Admin Journey:**
   - Manage all editor profiles
   - Monitor all Telegram chats
   - Handle disputes and support tickets
   - Process payments and refunds
   - Manage platform content

## 🗄️ Database Models

### Shared Models (shared-db/)

- **Session**: Chat sessions between creators and editors
- **Creator**: Creator user profiles
- **Editor**: Editor profiles with portfolios
- **Payment**: Razorpay payment records
- **Feedback**: Creator reviews and ratings
- **Dispute**: Conflict resolution records

### Backend Models

- **User**: Admin user accounts

## 🔧 Development Workflow

### Adding New Features

1. Update shared models if needed
2. Implement backend API endpoints
3. Update frontend components
4. Test Telegram bot integration
5. Update documentation

### Code Organization

- **shared-db/**: Database models used across services
- **shared-utils/**: Constants, types, and utilities
- **Backend/src/**: Express.js API server
- **Frontend/src/**: React frontend application
- **telegram-bot/src/**: Telegram bot logic

## 🚀 Deployment

### Production Setup

- **Frontend**: Deploy to DigitalOcean
- **Backend**: Deploy to DigitalOcean
- **Telegram Bot**: Deploy to Render (free tier)
- **Database**: MongoDB Atlas
- **Cache**: Redis Cloud

### Environment Variables

Ensure all production environment variables are set:

- Database connections
- API keys (Razorpay, Cloudinary)
- JWT secrets
- Telegram bot tokens

## 📝 API Documentation

### Authentication

- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Editors (Public)

- `GET /api/editors` - List all active editors
- `GET /api/editors/:id` - Get single editor

### Admin (Protected)

- `GET /api/admin/dashboard` - Admin dashboard stats
- Additional admin routes to be implemented

### Payments

- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For technical support or questions, please contact the development team.
