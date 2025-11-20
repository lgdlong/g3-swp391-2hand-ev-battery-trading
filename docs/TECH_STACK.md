# 📚 Tài Liệu Công Nghệ Sử Dụng Trong Dự Án

## 🎯 Tổng Quan

Dự án **2Hand EV Battery Trading** là một nền tảng thương mại điện tử cho phép người dùng mua bán pin xe điện đã qua sử dụng. Dự án sử dụng kiến trúc monorepo với các công nghệ hiện đại.

---

## 🏗️ Kiến Trúc Tổng Thể

- **Monorepo**: Sử dụng Turborepo và pnpm workspace
- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js 15 (React framework)
- **Database**: PostgreSQL 17
- **Containerization**: Docker & Docker Compose

---

## 🔧 Backend (API)

### Framework & Core

- **NestJS** `^11.0.1`
  - Framework Node.js dựa trên TypeScript
  - Hỗ trợ dependency injection, decorators, modules
  - URL: `http://localhost:8000`

### Database & ORM

- **PostgreSQL** `17`
  - Hệ quản trị cơ sở dữ liệu quan hệ
  - Chạy trong Docker container
  - Port: `5432`

- **TypeORM** `^0.3.26`
  - ORM (Object-Relational Mapping) cho TypeScript/JavaScript
  - Hỗ trợ migrations, relations, transactions

### Authentication & Authorization

- **Passport.js** `^0.7.0`
  - Middleware authentication cho Node.js
  - Hỗ trợ nhiều strategies

- **JWT (JSON Web Tokens)**
  - `@nestjs/jwt` `^11.0.0`
  - `passport-jwt` `^4.0.1`
  - Xác thực stateless với access token và refresh token

- **Google OAuth 2.0**
  - `passport-google-oauth20` `^2.0.0`
  - Đăng nhập bằng tài khoản Google

- **Local Authentication**
  - `passport-local` `^1.0.0`
  - Đăng nhập bằng email/phone + password

- **Bcrypt** `^6.0.0`
  - Hash mật khẩu an toàn

### Validation & Transformation

- **class-validator** `^0.14.2`
  - Validation decorators cho DTOs

- **class-transformer** `^0.5.1`
  - Transform objects và classes

- **Joi** `^18.0.1`
  - Schema validation

### API Documentation

- **Swagger/OpenAPI** `^11.2.0`
  - `@nestjs/swagger`
  - Tài liệu API tự động
  - URL: `http://localhost:8000/api`

### Real-time Communication

- **Socket.io** `^4.8.1`
  - `@nestjs/platform-socket.io` `^11.1.7`
  - `@nestjs/websockets` `^11.1.7`
  - WebSocket cho chat và notifications real-time

### Image Storage & Processing

- **Cloudinary** `^2.7.0`
  - CDN và image processing service
  - Upload, resize, optimize images
  - URL pattern: `res.cloudinary.com`

### Payment Gateway

- **PayOS**
  - Cổng thanh toán Việt Nam
  - Hỗ trợ thanh toán qua QR code, link thanh toán
  - Webhook integration cho payment status updates
  - Sử dụng cho:
    - Wallet topup (nạp tiền vào ví)
    - Post payment (thanh toán phí đăng bài)

### HTTP Client

- **Axios** `^1.12.1`
  - HTTP client cho API calls
  - `axios-retry` `^4.5.0` - Retry logic

- **@nestjs/axios** `^4.0.1`
  - Axios module cho NestJS

### Caching

- **Cache Manager** `^7.2.0`
  - `@nestjs/cache-manager` `^3.0.1`
  - In-memory caching

### File Upload

- **Multer** `^2.0.2`
  - Middleware xử lý multipart/form-data
  - Upload files

### Utilities

- **libphonenumber-js** `^1.12.15`
  - Validate và format số điện thoại

- **@nestjs/schedule** `^6.0.1`
  - Cron jobs và scheduled tasks

### Configuration

- **@nestjs/config** `^4.0.2`
  - Quản lý environment variables
  - Configuration module

### Testing

- **Jest** `^29.7.0`
  - Testing framework
  - `ts-jest` `^29.2.5` - TypeScript support
  - `supertest` `^7.0.0` - HTTP assertions

### Development Tools

- **TypeScript** `^5.7.3`
- **ESLint** `^9.18.0`
- **Prettier** `^3.4.2`
- **SWC** `^1.13.5` - Fast compiler

---

## 🎨 Frontend (Web)

### Framework

- **Next.js** `^15.5.0`
  - React framework với App Router
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Port: `3000`
  - Turbopack enabled cho development

### UI Library

- **React** `^19.1.0`
  - UI library
- **React DOM** `^19.1.0`

### Styling

- **Tailwind CSS** `^4.1.13`
  - Utility-first CSS framework
  - `@tailwindcss/postcss` `^4.1.13`
  - `tailwind-merge` `^3.3.1` - Merge Tailwind classes

- **PostCSS** `^8.5.6`
  - CSS processing

### UI Components

- **Radix UI**
  - Headless UI components:
    - `@radix-ui/react-alert-dialog` `^1.1.15`
    - `@radix-ui/react-avatar` `^1.1.10`
    - `@radix-ui/react-context-menu` `^2.2.16`
    - `@radix-ui/react-dialog` `^1.1.15`
    - `@radix-ui/react-dropdown-menu` `^2.1.16`
    - `@radix-ui/react-label` `^2.1.7`
    - `@radix-ui/react-scroll-area` `^1.2.10`
    - `@radix-ui/react-select` `^2.2.6`
    - `@radix-ui/react-separator` `^1.1.7`
    - `@radix-ui/react-slot` `^1.2.3`
    - `@radix-ui/react-switch` `^1.2.6`
    - `@radix-ui/react-tabs` `^1.1.13`
    - `@radix-ui/react-tooltip` `^1.2.8`

- **Lucide React** `^0.543.0`
  - Icon library

### Form Management

- **React Hook Form** `^7.62.0`
  - Form state management
  - `@hookform/resolvers` `^5.2.1` - Validation resolvers

- **Zod** `^4.1.7`
  - Schema validation
  - TypeScript-first validation

### State Management & Data Fetching

- **TanStack Query (React Query)** `^5.87.4`
  - Server state management
  - Data fetching, caching, synchronization
  - `@tanstack/react-query-devtools` `^5.90.2` - DevTools

### HTTP Client

- **Axios** `^1.11.0`
  - API calls từ frontend

### Real-time Communication

- **Socket.io Client** `^4.8.1`
  - WebSocket client cho real-time features

### Image Handling

- **next-cloudinary** `^6.16.0`
  - Cloudinary integration cho Next.js
  - Image optimization và CDN

- **react-dropzone** `^14.3.8`
  - Drag & drop file upload

### Theming

- **next-themes** `^0.4.6`
  - Dark/light mode support

### Notifications

- **Sonner** `^2.0.7`
  - Toast notifications

### Utilities

- **class-variance-authority** `^0.7.1`
  - Variant management cho components

- **clsx** `^2.1.1`
  - Conditional className utility

### Development Tools

- **TypeScript** `5.9.2`
- **ESLint** `^9.34.0`
- **tw-animate-css** `^1.3.8` - Tailwind animations

---

## 💳 Payment & Transaction

### Payment Gateway

- **PayOS**
  - Cổng thanh toán chính thức
  - Tích hợp qua REST API
  - Webhook support
  - Hỗ trợ:
    - QR Code payment
    - Payment link
    - Payment status tracking

### Payment Features

- **Wallet Topup**: Nạp tiền vào ví điện tử
- **Post Payment**: Thanh toán phí đăng bài
- **Refunds**: Hoàn tiền cho các giao dịch

### Transaction Management

- Payment orders tracking
- Wallet transactions history
- Service type categorization

---

## 🗄️ Database

### Database System

- **PostgreSQL 17**
  - Relational database
  - ACID compliance
  - Advanced features: JSON support, full-text search

### Database Features

- Migrations với TypeORM
- Relations (One-to-Many, Many-to-One, Many-to-Many)
- Indexes cho performance
- Transactions cho data integrity

### Database Schema

- Accounts (users)
- Posts (bài đăng)
- Wallets & Wallet Transactions
- Payment Orders
- Ratings & Reviews
- Bookmarks
- Service Types
- Settings (Fee Tiers, Post Lifecycle)
- Verification Requests
- Admin Statistics

---

## 🔐 Authentication & Security

### Authentication Methods

1. **Email/Phone + Password**
   - Local authentication với Passport Local
   - Password hashing với Bcrypt

2. **Google OAuth 2.0**
   - Social login
   - Auto account creation
   - Profile sync

### Security Features

- **JWT Tokens**
  - Access token (short-lived)
  - Refresh token (long-lived, httpOnly cookie)
  - Token rotation

- **Password Security**
  - Bcrypt hashing
  - Salt rounds

- **CORS Configuration**
  - Whitelist origins
  - Credentials support

- **Security Headers** (Next.js)
  - Content Security Policy (CSP)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy

### Authorization

- Role-based access control (RBAC)
- Guards:
  - JWT Auth Guard
  - Roles Guard
  - Account Status Guard

---

## 📦 Image Storage & CDN

### Cloudinary

- **Service**: Cloudinary
- **Features**:
  - Image upload
  - Automatic optimization
  - Resize & crop
  - CDN delivery
  - Format conversion
  - Lazy loading support

### Image Domains (Whitelisted)

- `res.cloudinary.com` - Cloudinary CDN
- `lh3.googleusercontent.com` - Google OAuth avatars
- `avatar.iran.liara.run` - Default avatars
- `placehold.co` - Placeholder images

---

## 🔄 Real-time Features

### Socket.io

- **Backend**: `@nestjs/platform-socket.io`
- **Frontend**: `socket.io-client`
- **Features**:
  - Real-time chat
  - Notifications
  - Live updates
  - WebSocket connections

---

## 📝 API Documentation

### Swagger/OpenAPI

- **Framework**: `@nestjs/swagger`
- **URL**: `http://localhost:8000/api`
- **Features**:
  - Auto-generated API docs
  - Interactive testing
  - Bearer token authentication
  - Request/response schemas
  - API versioning

---

## 🛠️ Development Tools

### Monorepo Management

- **Turborepo** `^2.5.6`
  - Build system cho monorepo
  - Task orchestration
  - Caching

- **pnpm** `10.18.2`
  - Package manager
  - Workspace support
  - Fast installs

### Code Quality

- **ESLint** `^9.18.0`
  - Linting
  - Custom configs per package

- **Prettier** `^3.6.2`
  - Code formatting
  - Consistent style

- **Husky** `^9.1.7`
  - Git hooks
  - Pre-push checks

### TypeScript Configuration

- Shared TypeScript configs
- Strict mode enabled
- Path aliases

---

## 🐳 DevOps & Deployment

### Containerization

- **Docker**
  - PostgreSQL container
  - Docker Compose setup

### Environment Variables

- Backend: `.env` file
- Frontend: Next.js environment variables
- Database: Docker Compose environment

### Build & Scripts

- `pnpm dev` - Development mode
- `pnpm build` - Production build
- `pnpm lint` - Linting
- `pnpm format` - Format code

---

## 📊 Monitoring & Logging

### Logging

- NestJS Logger
- Console logging
- Error tracking

### Scheduled Tasks

- `@nestjs/schedule`
- Cron jobs
- Task scheduling

---

## 🔗 External Services Integration

1. **PayOS**
   - Payment processing
   - Webhook endpoints

2. **Cloudinary**
   - Image storage & CDN
   - Image processing

3. **Google OAuth**
   - Authentication
   - Profile data

---

## 📦 Package Structure

```
g3-swp391-2hand-ev-battery-trading/
├── apps/
│   ├── api/          # NestJS Backend
│   ├── web/          # Next.js Frontend
│   ├── db/           # Database dumps
│   └── docs/         # Documentation
├── packages/
│   ├── eslint-config/      # Shared ESLint config
│   └── typescript-config/  # Shared TS config
├── scripts/          # Utility scripts
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 10.18.2
- Docker & Docker Compose
- PostgreSQL 17 (via Docker)

### Installation

```bash
# Install dependencies
pnpm install

# Start database
docker-compose up -d

# Start backend (port 8000)
cd apps/api
pnpm dev

# Start frontend (port 3000)
cd apps/web
pnpm dev
```

### Access Points

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/api`
- Database: `localhost:5432`

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [PayOS Documentation](https://payos.vn/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Socket.io Documentation](https://socket.io/docs/)

---

## 📝 Notes

- Dự án sử dụng TypeScript cho type safety
- Monorepo structure cho code sharing
- Environment variables cần được cấu hình đúng
- Database migrations cần chạy trước khi start app
- CORS và security headers đã được cấu hình

---

**Last Updated**: 2025
**Project**: 2Hand EV Battery Trading Platform
**Version**: 1.0.0
