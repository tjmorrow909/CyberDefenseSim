# CyberDefense Simulator

A comprehensive cybersecurity training platform built with React, TypeScript, and Express.js. Master cybersecurity concepts through hands-on simulations, interactive scenarios, and real-world security tools.

## 🚀 Features

- **JWT-based Authentication**: Secure user authentication with access and refresh tokens
- **Interactive Security Tools**: Vulnerability scanner, threat intelligence, cryptography lab
- **Progress Tracking**: Track learning progress across different cybersecurity domains
- **Achievement System**: Earn achievements and XP for completing scenarios
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui components
- **Real-time Updates**: Live progress tracking and notifications

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Query** for state management
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **JWT** for authentication
- **Drizzle ORM** with PostgreSQL
- **Winston** for logging
- **Helmet** for security headers
- **Rate limiting** and CORS protection

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Vitest** for testing
- **TypeScript** for type safety

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CyberDefenseSim
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)
- `SESSION_SECRET`: Secret key for sessions

### Optional Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run validate` - Run all checks (type-check, lint, format, test)

## 🏗️ Project Structure

```
CyberDefenseSim/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── ...
├── server/                 # Backend Express application
│   ├── routes/             # API route handlers
│   ├── auth.ts             # Authentication middleware
│   ├── validation.ts       # Input validation schemas
│   ├── logger.ts           # Logging configuration
│   └── ...
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── ...
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with configurable rounds
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable origin restrictions
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM

## 🧪 Testing

The project uses Vitest for testing with the following setup:

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **Coverage Reports**: Test coverage tracking

Run tests:
```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables for Production
Ensure all required environment variables are set:
- Set `NODE_ENV=production`
- Use strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET`
- Configure `DATABASE_URL` for your production database
- Set appropriate `ALLOWED_ORIGINS` for CORS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style (ESLint + Prettier)
- Write tests for new features
- Update documentation as needed
- Ensure all checks pass (`npm run validate`)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error logs and environment details

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.
