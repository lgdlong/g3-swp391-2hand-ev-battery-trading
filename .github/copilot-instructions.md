# GitHub Copilot Instructions

**2nd-hand EV Battery Trading Platform** - TypeScript monorepo for buying/selling used EV batteries.

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: NestJS, TypeORM, PostgreSQL
- **Auth**: JWT + Google OAuth
- **Payments**: PayOS integration, Wallet system
- **Real-time**: WebSocket (Chat)

## Architecture

```
apps/
├── web/          # Next.js frontend
├── api/          # NestJS backend
└── db/           # Database migrations
```

## Core Business Flow

**Post Creation**: Draft → Payment (wallet deduction + fee tier) → Upload images → Publish → Review
**Wallet System**: Top-up via PayOS → Deduct for posts/verification → Transaction logging
**Payment**: Atomic operations (wallet + PostPayment record) via TransactionsService

## Key Entities

- **Account** (USER/ADMIN), **Post** (CAR/BIKE/BATTERY), **PostPayment**, **Wallet**, **WalletTransaction**
- **PostVerificationRequest**, **Catalog** (Brand→Model→Trim), **FeeTier** (price-based deposits)

## Coding Standards

### TypeScript Rules

- Strict mode, explicit return types, `interface` over `type`
- **PascalCase**: classes/interfaces, **camelCase**: variables/functions, **kebab-case**: files
- Use `Number.parseFloat()` not global `parseFloat`
- Extract complex ternaries into functions

### Frontend (Next.js)

**Structure**:

- `app/(route-groups)/page.tsx` - App Router pages
- `app/(route)/_components/` - Page-specific components
- `app/(route)/_hooks/` - Page-specific hooks (e.g., `useCreatePost.ts`)
- `components/` - Shared components
- `lib/api/` - API functions (`featureApi.ts`)
- `hooks/` - Global hooks (`useFeatureName.ts`)
- `types/` - TypeScript interfaces
- `validations/` - Zod schemas

**Components**:

```typescript
// Function components with TypeScript
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

// Page metadata
export const metadata = {
  title: 'Page Title',
  description: 'Page description',
};
```

**State**:

- **React Hook Form** + **Zod** for forms
- **TanStack Query** for server state
- **Custom hooks** for complex logic

```typescript
// Form with validation
const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

// Query with refetch safety
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['post', postId],
  queryFn: () => getPostById(postId),
  enabled: !!postId,
});

// Mutation with invalidation
const mutation = useMutation({
  mutationFn: loginUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
    router.push('/dashboard');
  },
});

// Custom hooks (prefix with 'use')
export function useCreatePost() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ... logic
  return { handleSubmit, isSubmitting };
}
```

**Styling**:

- **Tailwind CSS** + **shadcn/ui** components
- **lucide-react** for icons, **sonner** for toasts

```typescript
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

<Button disabled={loading}>
  {loading ? (
    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
  ) : 'Submit'}
</Button>

toast.success('Success!');
toast.error('Error', { description: 'Details', duration: 5000 });
```

### Backend (NestJS)

**Module Structure**:

```
src/modules/feature-name/
├── dto/           # create/update/response DTOs
├── entities/      # TypeORM entities
├── services/      # Business logic
├── controllers/   # HTTP endpoints
└── mappers/       # Entity-to-DTO (optional)
```

**Services**:

```typescript
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postsRepo: Repository<Post>,
    private readonly transactionsService: TransactionsService,
    private readonly dataSource: DataSource,
  ) {}

  async deductPostCreationFee(userId: number, priceVnd: number, postId: string) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['seller'],
    });

    if (!post || post.seller.id !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    return this.transactionsService.processPostPayment(userId, postId, priceVnd);
  }
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

**Controllers**:

```typescript
@ApiTags('Feature')
@ApiBearerAuth()
@Controller('feature')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature' })
  @ApiResponse({ status: HttpStatus.CREATED, type: FeatureResponseDto })
  async create(
    @Body() dto: CreateFeatureDto,
    @CurrentUser() user: ReqUser,
  ): Promise<FeatureResponseDto> {
    return this.featureService.create(dto, user.sub);
  }
}
```

**Atomic Transactions**:

```typescript
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PostPayment)
    private readonly postPaymentRepo: Repository<PostPayment>,
    private readonly walletsService: WalletsService,
    private readonly feeTierService: FeeTierService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Process post payment with wallet deduction and create payment record
   * Ensures both wallet deduction and payment record creation succeed together
   */
  async processPostPayment(userId: number, postId: string, priceVnd: number) {
    // Check duplicate payment
    const existingPayment = await this.isPostPaid(postId);
    if (existingPayment) {
      throw new BadRequestException('Post already paid');
    }

    // Calculate fee from tier
    const feeTiers = await this.feeTierService.findAll();
    const applicableTier = feeTiers.find((tier) => {
      return priceVnd >= tier.minPrice && (tier.maxPrice === null || priceVnd <= tier.maxPrice);
    });

    const depositAmount = Math.round(priceVnd * applicableTier.depositRate);

    // Wallet deduction (atomic with transaction)
    const walletResult = await this.walletsService.deduct(
      userId,
      depositAmount.toString(),
      'POST_PAYMENT',
      `Post payment #${postId}`,
      'posts',
      postId,
    );

    // Create payment record
    const postPayment = await this.createPostPayment({
      postId,
      accountId: userId,
      amountPaid: depositAmount.toString(),
      walletTransactionId: walletResult.transaction.id,
    });

    return { wallet: walletResult.wallet, transaction: walletResult.transaction, postPayment };
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

## Domain Context

**API Patterns**: RESTful endpoints, DTOs, pagination (`limit`, `offset`), Swagger docs
**Database**: TypeORM, `snake_case` columns, `camelCase` properties, audit fields

## Best Practices

### ✅ Do

- Use `Number.parseFloat()` not global `parseFloat`
- Extract complex ternaries into functions
- Use `@CurrentUser()` decorator for auth context
- Check `isFetching` to avoid race conditions in useEffect
- Invalidate queries after mutations
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### ❌ Don't

- Nest complex ternary operations
- Expose entities directly in API responses
- Mix business logic in controllers
- Run useEffect without checking `isFetching`

---

**Package Manager**: pnpm
**Branch Names**: `feat/`, `fix/`, `chore/`, `docs/`
**Commits**: Conventional format (`feat:`, `fix:`, `docs:`, `chore:`)
