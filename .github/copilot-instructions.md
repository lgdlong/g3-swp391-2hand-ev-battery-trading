# GitHub Copilot Instructions

This document provides context, coding guidelines, and specific prompting instructions for the **2nd-hand EV Battery Trading Platform** project to help GitHub Copilot generate accurate, contextually-aware suggestions.

## How to Use This Document

GitHub Copilot should reference this document to:

- Understand project architecture and conventions
- Generate code that follows established patterns
- Maintain consistency across the monorepo
- Provide contextually appropriate suggestions based on the current file/module

## Project Overview

This is a **TypeScript monorepo** using **Turborepo** for a 2nd-hand EV Battery Trading Platform. The project enables users to buy and sell used electric vehicle batteries with detailed condition information and secure transactions.

### Architecture

- **Monorepo Structure**: Turborepo with pnpm workspace
- **Frontend**: Next.js 15 with App Router (TypeScript, Tailwind CSS)
- **Backend**: NestJS API (TypeScript, TypeORM, PostgreSQL)
- **Database**: PostgreSQL with TypeORM migrations
- **Authentication**: JWT + Google OAuth integration

## Repository Structure

```
g3-swp391-2hand-ev-battery-trading/
├── apps/
│   ├── web/           # Next.js frontend application
│   ├── api/           # NestJS backend API
│   ├── db/            # Database scripts and migrations
│   └── docs/          # Documentation site
├── packages/          # Shared packages
└── .github/          # GitHub workflows and templates
```

## Coding Standards & Conventions

### General TypeScript Rules

- Use **strict TypeScript** configuration
- Prefer `interface` over `type` for object types
- Use **explicit return types** for functions
- Follow **PascalCase** for classes, interfaces, types
- Follow **camelCase** for variables, functions, properties
- Use **kebab-case** for file names and directories

### Frontend (Next.js) Conventions

#### File Structure & Context Awareness

When working in the `apps/web/` directory, Copilot should assume:

- **App Router** structure: `app/(route-groups)/page.tsx`, `app/(route-groups)/layout.tsx`
- Components in `components/` directory with `ComponentName.tsx`
- Utilities in `lib/` directory (auth, API clients, utilities)
- Types in `types/` directory (TypeScript interfaces and types)
- API calls in `lib/api/` directory
- Form validations in `validations/` directory using Zod
- Hooks in `hooks/` directory

#### React Components

```typescript
// Always use function components with explicit TypeScript interfaces
interface ComponentProps {
  title: string;
  optional?: boolean;
}

export default function ComponentName({ title, optional }: ComponentProps) {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

// For page components, include metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

#### State Management

- Use **React Hook Form** for form handling with **Zod validation**
- Use **TanStack Query** for server state management
- Use **useState/useEffect** for local component state

```typescript
// Form handling pattern
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/validations/login-schema';

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

// API calls pattern
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/lib/api/auth';

const loginMutation = useMutation({
  mutationFn: loginUser,
  onSuccess: (data) => router.push('/dashboard'),
  onError: (error) => handleApiError(error, form),
});
```

#### Styling

- Use **Tailwind CSS** for styling
- Use **shadcn/ui** components when available
- Follow **mobile-first** responsive design

```typescript
// Component styling pattern
<div className="container mx-auto px-4 py-8">
  <Card className="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-center">
        Login
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </CardContent>
  </Card>
</div>
```

### Backend (NestJS) Conventions

#### Module Structure

```
src/modules/feature-name/
├── dto/                    # Data Transfer Objects
├── entities/              # TypeORM entities
├── services/              # Business logic
├── controllers/           # HTTP controllers
├── mappers/               # Entity-to-DTO mappers
└── feature-name.module.ts # Module definition
```

#### Controllers

```typescript
@ApiTags('Feature')
@Controller('feature')
export class FeatureController {
  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, type: FeatureResponseDto })
  async create(@Body() dto: CreateFeatureDto): Promise<FeatureResponseDto> {
    // Implementation
  }
}
```

#### Services

```typescript
@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    // Implementation
  }
}
```

#### DTOs & Validation

```typescript
export class CreateFeatureDto {
  @ApiProperty({ example: 'Feature name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;
}
```

#### Entities

```typescript
@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Controllers

```typescript
@ApiTags('Feature')
@Controller('feature')
export class FeatureController {
  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: 201, type: FeatureResponseDto })
  async create(@Body() dto: CreateFeatureDto): Promise<FeatureResponseDto> {
    // Implementation
  }
}
```

#### Services

```typescript
@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
  ) {}

  async create(dto: CreateFeatureDto): Promise<Feature> {
    // Implementation
  }
}
```

#### DTOs & Validation

```typescript
export class CreateFeatureDto {
  @ApiProperty({ example: 'Feature name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiPropertyOptional({ example: 'Optional description' })
  @IsOptional()
  @IsString()
  description?: string;
}
```

#### Entities

```typescript
@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Domain-Specific Context

## Domain-Specific Context

### Core Business Entities

- **Account**: Users with roles (USER, ADMIN)
- **Post**: Listings for battery sales
- **PostDetails**: Detailed specifications (car/bike/battery details)
- **Catalogs**: Reference data for brands, models, colors, etc.

### Key Features

- **Authentication**: JWT + Google OAuth
- **Posts Management**: Create, read, update posts for battery sales
- **Catalog System**: Hierarchical data (Brand → Model → Trim)
- **Search & Filtering**: Posts by location, price, battery specifications
- **Admin Dashboard**: Content moderation and user management

### API Patterns

- Use **RESTful** endpoints: `GET /posts`, `POST /posts`, `PUT /posts/:id`
- Return **consistent response formats** with DTOs
- Use **pagination** for list endpoints: `ListQueryDto` with `limit`, `offset`
- Include **Swagger documentation** for all endpoints

### Database Patterns

- Use **TypeORM** with decorators for entities
- Follow **snake_case** for database column names
- Use **camelCase** for entity properties
- Include **audit fields**: `createdAt`, `updatedAt`
- Use **soft deletes** where appropriate

## Authentication & Authorization

### JWT Strategy

```typescript
// JWT payload structure
interface JwtPayload {
  sub: number; // User ID
  email: string | null;
  phone: string | null;
  role: AccountRole;
}
```

### Google OAuth Flow

1. Frontend: `GET /auth/google` → Backend OAuth start
2. Google consent → `GET /auth/google-redirect` → Backend callback
3. Backend creates/updates user → Redirects to frontend with tokens
4. Frontend: `/oauth/google` → Extract tokens → Login user

## Error Handling

### Backend Exceptions

```typescript
// Use NestJS built-in exceptions
throw new BadRequestException('Invalid input');
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Access denied');
```

### Frontend Error Handling

```typescript
// Use React Query error handling
const mutation = useMutation({
  mutationFn: apiCall,
  onError: (error) => handleApiError(error, form, 'Operation failed'),
});
```

## Testing Patterns

### Backend Testing

- Use **Jest** for unit testing
- Test **services** with mocked repositories
- Test **controllers** with mocked services
- Use **supertest** for e2e testing

### Frontend Testing

- Use **Jest + React Testing Library**
- Test **component behavior**, not implementation
- Mock **API calls** with MSW or similar

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=15m

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

````env
NEXT_PUBLIC_API_URL=http://localhost:8000
- Return **consistent response formats** with DTOs
- Use **pagination** for list endpoints: `ListQueryDto` with `limit`, `offset`
- Include **Swagger documentation** for all endpoints

### Database Patterns

- Use **TypeORM** with decorators for entities
- Follow **snake_case** for database column names
- Use **camelCase** for entity properties
- Include **audit fields**: `createdAt`, `updatedAt`
- Use **soft deletes** where appropriate

## Authentication & Authorization

### JWT Strategy

```typescript
// JWT payload structure
interface JwtPayload {
  sub: number; // User ID
  email: string | null;
  phone: string | null;
  role: AccountRole;
}
````

### Google OAuth Flow

1. Frontend: `GET /auth/google` → Backend OAuth start
2. Google consent → `GET /auth/google-redirect` → Backend callback
3. Backend creates/updates user → Redirects to frontend with tokens
4. Frontend: `/oauth/google` → Extract tokens → Login user

## Error Handling

### Backend Exceptions

```typescript
// Use NestJS built-in exceptions
throw new BadRequestException('Invalid input');
throw new NotFoundException('Resource not found');
throw new UnauthorizedException('Access denied');
```

### Frontend Error Handling

```typescript
// Use React Query error handling
const mutation = useMutation({
  mutationFn: apiCall,
  onError: (error) => handleApiError(error, form, 'Operation failed'),
});
```

## Testing Patterns

### Backend Testing

- Use **Jest** for unit testing
- Test **services** with mocked repositories
- Test **controllers** with mocked services
- Use **supertest** for e2e testing

### Frontend Testing

- Use **Jest + React Testing Library**
- Test **component behavior**, not implementation
- Mock **API calls** with MSW or similar

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=15m

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Common Patterns & Anti-Patterns

### ✅ Do

- Use **TypeScript strictly** with proper types
- Implement **proper error handling** at all levels
- Use **consistent naming conventions**
- Follow **single responsibility principle**
- Use **dependency injection** in NestJS
- Implement **proper validation** with class-validator/Zod
- Use **DTOs for API responses** instead of raw entities

### ❌ Don't

- Use `any` type unless absolutely necessary
- Expose **database entities directly** in API responses
- Mix **business logic** in controllers
- Use **synchronous** operations for I/O
- Hardcode **configuration values**
- Skip **input validation**
- Use **console.log** in production code (use proper logging)

## Package Management

- Use **pnpm** as the package manager
- Run commands from **root directory**: `pnpm dev`, `pnpm build`
- Use **workspace dependencies** for shared code
- Keep dependencies **up to date** but test thoroughly

## Git Workflow

### Branch Naming

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `chore/task-description` - Maintenance tasks
- `docs/documentation-update` - Documentation changes

### Commit Messages

Follow conventional commits:

- `feat: add user authentication`
- `fix: resolve login redirect issue`
- `docs: update API documentation`
- `chore: update dependencies`

---

This document should be updated as the project evolves to ensure GitHub Copilot has the most current context for generating relevant suggestions.
