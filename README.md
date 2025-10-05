


# 2nd-hand EV Battery Trading Platform

Nền tảng thương mại điện tử chuyên về mua bán pin xe điện cũ, được xây dựng với kiến trúc monorepo sử dụng Turborepo.

> [Frontend Docs](apps/web/README.md)
> 
> [Backend Docs](apps/api/README.md)
> 
> [Database Docs](apps/db/README.md)

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Tính năng chính](#tính-năng-chính)
- [API Documentation](#api-documentation)
- [Cơ sở dữ liệu](#cơ-sở-dữ-liệu)
- [Deployment](#deployment)
- [Branch & Commit Convention](#branch--commit-convention)
- [Đóng góp](#đóng-góp)


## Giới thiệu

Dự án **2nd-hand EV Battery Trading Platform** là một nền tảng thương mại điện tử chuyên biệt để mua bán pin xe điện đã qua sử dụng. Hệ thống được phát triển nhằm tạo ra một thị trường minh bạch, an toàn cho việc trao đổi pin xe điện, góp phần vào việc tái chế và bảo vệ môi trường.

### Mục tiêu dự án:
- Tạo nền tảng kết nối người mua và bán pin xe điện cũ
- Cung cấp thông tin chi tiết về tình trạng pin
- Đảm bảo giao dịch an toàn và minh bạch
- Thúc đẩy việc tái chế và sử dụng bền vững

## Công nghệ sử dụng

### Frontend
- **Next.js 15** - React framework với App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Static type checking
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Primary database
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing

### DevOps & Tools
- **Turborepo** - Monorepo management
- **Docker** - Containerization
- **pnpm** - Package manager
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Cấu trúc dự án

```
g3-swp391-2hand-ev-battery-trading/
├── apps/                    # Main applications
│   ├── api/                # NestJS Backend API
│   ├── web/                # Next.js Frontend
│   ├── docs/               # Documentation site
│   └── db/                 # Database scripts & dumps
├── packages/               # Shared packages
│   ├── eslint-config/      # Shared ESLint configurations
│   └── typescript-config/  # Shared TypeScript configurations
├── docker-compose.yml      # Docker configuration
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml    # pnpm workspace configuration
```

### Chi tiết từng app:

- **`apps/api`**: Backend API được xây dựng với NestJS, chứa các module authentication, accounts, và business logic
- **`apps/web`**: Frontend application với Next.js, UI components và client-side logic
- **`apps/docs`**: Documentation site cho dự án
- **`apps/db`**: Database migration scripts, dump files và database setup

## Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18
- pnpm >= 9.0.0
- PostgreSQL
- Docker

### 1. Clone repository
```bash
git clone https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading.git
cd g3-swp391-2hand-ev-battery-trading
```

### 2. Cài đặt dependencies
```bash
pnpm install
```

### 3. Cấu hình environment variables
```bash
# Copy và chỉnh sửa file .env cho API
cp apps/api/.env.example apps/api/.env

# Copy và chỉnh sửa file .env cho Web
cp apps/web/.env.example apps/web/.env
```

### 4. Setup database
```bash
# Chạy PostgreSQL với Docker
docker-compose up -d

# Hoặc restore từ dump file
psql -U postgres -d 2hand_ev_battery_trading < apps/db/dump-*.dump
```

### 5. Chạy development server
```bash
# Chạy tất cả services
pnpm dev

# Hoặc chạy từng service riêng biệt
pnpm dev --filter=api     # Backend API (port 8000)
pnpm dev --filter=web     # Frontend (port 3000)
pnpm dev --filter=docs    # Documentation (port 3001)
```

### 6. Build for production
```bash
# Build tất cả
pnpm build

# Build specific app
pnpm build --filter=api
pnpm build --filter=web
```

## Tính năng chính

### Authentication & Authorization
- Đăng ký/Đăng nhập với email hoặc số điện thoại
- JWT-based authentication
- Role-based access control
- Password reset functionality

### Marketplace Features
- Đăng bán pin xe điện với thông tin chi tiết
- Tìm kiếm và lọc sản phẩm
- Đánh giá và review sản phẩm
- Hệ thống chat giữa buyer và seller

### User Management
- Profile management
- Transaction history
- Wishlist và favorites
- Notification system

### Admin Dashboard
- User management
- Product moderation
- Analytics và reporting
- System configuration


## API Documentation

API endpoints được document chi tiết tại:
- Development: http://localhost:8000/api
- Production: `[Production URL]/api`


## Cơ sở dữ liệu

### Database Schema

>https://dbdiagram.io/d/g3-swp391-68bee64661a46d388e00495e

### Database Management
```bash
# Backup database
pg_dump -U postgres 2hand_ev_battery_trading > backup.sql

# Restore database
psql -U postgres -d 2hand_ev_battery_trading < backup.sql
```

## Deployment

### Development
```bash
pnpm dev
```

### Production
```bash
# Build
pnpm build

# Start production server
pnpm start:prod --filter=api
```

### Docker Deployment
```bash
# Build và chạy với Docker Compose
docker-compose up --build
```


# Branch & Commit Convention

## Branch naming convention

**Cấu trúc chung**

```
<type>/<layer>/<scope>
```

* **type**: `feat` | `fix` | `docs` | `chore` | `release` | `test`
* **layer**: `backend` | `frontend` *(có thể bỏ nếu không cần)*
* **scope**: mô tả ngắn việc làm, viết `kebab-case`

**Ví dụ**

* `feat/backend/api-login`
* `feat/frontend/login-layout`
* `fix/frontend/header-css`
* `docs/backup-db`
* `chore/backend/update-dependencies`
* `release/v1.0.0`
* `test/backend/user-service`

**Quy tắc nhanh**

* Viết thường toàn bộ.
* Ngắn gọn ≤ 5 từ cho scope.
* Nhánh ngắn hạn dùng cho từng task, merge xong thì xoá.


## Commit Message Convention

**Cấu trúc chuẩn**

```
<type>(<scope>): <short message>
```

**Các type hợp lệ**

| Type       | Ý nghĩa                                   |
| ---------- | ----------------------------------------- |
| `feat`     | Thêm tính năng mới                        |
| `fix`      | Sửa lỗi                                   |
| `docs`     | Cập nhật tài liệu                         |
| `style`    | Format/code style, không đổi logic        |
| `refactor` | Refactor code, không thêm feature/fix bug |
| `test`     | Thêm hoặc chỉnh sửa test                  |
| `chore`    | Việc phụ trợ: CI, config, deps, cleanup   |

**Ví dụ commit**

```bash
git commit -m "feat(login): support email/phone login"
git commit -m "fix(auth): prevent null password"
git commit -m "docs(readme): update workflow section"
git commit -m "refactor(chat): extract socket logic"
git commit -m "chore(db): dump init.sql"
git commit -m "test(user): add service tests"
```

**Tip**: Scope commit nên gần giống với phần sau `/` của branch.
Ví dụ: branch `feat/backend/api-login` → commit `feat(auth): add login endpoint`.


## Đóng góp

### Quy trình đóng góp
1. Fork repository
2. Tạo branch mới theo convention ở trên
3. Commit code với message theo chuẩn
4. Tạo Pull Request
5. Code review và merge

### Development workflow
```bash
# Tạo branch mới
git checkout -b feat/frontend/new-feature

# Thực hiện thay đổi và commit
git add .
git commit -m "feat(feature): add new feature"

# Push và tạo PR
git push origin feat/frontend/new-feature
```

### Lưu ý quan trọng
- Tuân thủ coding standards (ESLint, Prettier)
- Viết tests cho code mới
- Cập nhật documentation khi cần
- Đảm bảo build thành công trước khi tạo PR


## Liên hệ & Hỗ trợ

- **Repository**: [g3-swp391-2hand-ev-battery-trading](https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading)
- **Issues**: [GitHub Issues](https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading/issues)


## License

Dự án này được phát triển cho mục đích học tập trong khuôn khổ môn SWP391 - FPT University.


**Nếu dự án hữu ích, hãy cho chúng mình một star nhé!**
