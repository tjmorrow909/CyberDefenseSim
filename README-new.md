# 🛡️ CyberDefense Simulator

A comprehensive cybersecurity training platform designed to provide hands-on learning experiences for cybersecurity professionals and students. Built with modern web technologies and aligned with industry standards like CompTIA Security+.

## 🌟 Features

### 🎯 Core Learning Features
- **Interactive Cybersecurity Scenarios** - Hands-on labs and simulations
- **Comprehensive Domain Coverage** - Aligned with CompTIA Security+ curriculum
- **Progress Tracking** - Detailed analytics and learning paths
- **Achievement System** - Gamified learning with badges and XP
- **Real-time Collaboration** - WebSocket-powered interactive features

### 🔧 Technical Features
- **Modern Tech Stack** - React, TypeScript, Node.js, PostgreSQL
- **Secure Authentication** - JWT-based auth with refresh tokens
- **Real-time Updates** - WebSocket integration for live features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Production Ready** - Docker support, CI/CD pipeline, comprehensive testing

### 📚 Educational Domains
1. **General Security Concepts** (12% of curriculum)
2. **Threats, Vulnerabilities & Mitigations** (22% of curriculum)
3. **Security Architecture** (18% of curriculum)
4. **Security Operations** (28% of curriculum)
5. **Governance, Risk and Compliance** (20% of curriculum)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (optional - can use Docker)
- Docker & Docker Compose (optional)

### Option 1: Automated Setup (Recommended)
```bash
git clone https://github.com/your-org/cyberdefense-simulator.git
cd cyberdefense-simulator
npm run setup
```

### Option 2: Manual Setup
```bash
# Clone the repository
git clone https://github.com/your-org/cyberdefense-simulator.git
cd cyberdefense-simulator

# Install dependencies
npm ci

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Setup database (with Docker)
docker-compose up -d postgres redis

# Run migrations
npm run db:push

# Start development server
npm run dev
```

### Option 3: Docker Setup
```bash
# Development environment
npm run docker:dev

# Production environment
npm run docker:prod
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Vite** - Fast build tool and dev server
- **React Query** - Server state management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe server code
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe database toolkit
- **JWT** - Secure authentication
- **WebSockets** - Real-time communication

### DevOps & Tools
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Husky** - Git hooks

## 🏗️ Project Structure

```
CyberDefenseSim/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Node.js application
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   └── utils/              # Utility functions
├── shared/                 # Shared types and schemas
├── migrations/             # Database migrations
├── scripts/                # Build and deployment scripts
├── docs/                   # Documentation
└── tests/                  # Test files
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows

## 🚀 Deployment

### Environment Variables
```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Features
ENABLE_WEBSOCKETS=true
ENABLE_RATE_LIMITING=true
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or use Docker
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Code Quality
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [docs](docs/) directory
- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-org/cyberdefense-simulator/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-org/cyberdefense-simulator/discussions)
- **Security**: Report security issues to security@yourorg.com

## 🙏 Acknowledgments

- CompTIA for the Security+ certification framework
- The cybersecurity education community
- All contributors and supporters

---

**Built with ❤️ for cybersecurity education**
