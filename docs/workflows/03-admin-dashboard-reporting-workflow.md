# Admin Dashboard & Reporting Workflow

## Tổng Quan

Admin Dashboard cung cấp các thống kê và báo cáo toàn diện về hoạt động của hệ thống, bao gồm: tài chính, người dùng, bài đăng, giao dịch và fraud detection.

---

## Dashboard Architecture

```mermaid
graph TD
    A[Admin Dashboard Page] --> B[Stats Cards]
    A --> C[Financial Stats Cards]
    A --> D[Dashboard Charts]
    A --> E[Recent Tables]
    
    B --> B1[Total Users]
    B --> B2[Total Posts]
    B --> B3[Active Users]
    B --> B4[New Users Today]
    B --> B5[Posts by Status]
    B --> B6[Posts by Type]
    
    C --> C1[Total Wallet Balance]
    C --> C2[Total Topup Amount]
    C --> C3[Total Fees Collected]
    C --> C4[Total Deposit Collected]
    C --> C5[Total Verification Fees]
    C --> C6[Net Revenue]
    
    D --> D1[User Growth Chart]
    D --> D2[Post Growth Chart]
    D --> D3[Post Status Distribution]
    D --> D4[Post Type Distribution]
    
    E --> E1[Recent Users Table]
    E --> E2[Recent Posts Table]
```

---

## 1. Dashboard Statistics Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin as 👨‍💼 Admin
    participant Web as 🌐 Admin Dashboard
    participant API as 🔧 API Backend
    participant Stats as 📊 Statistics Service
    participant DB as 🗄️ Database

    Note over Admin,DB: Load Dashboard - Multiple parallel queries

    Admin->>Web: Navigate to /admin
    
    Note over Web,API: Parallel data fetching with React Query
    
    par Fetch Dashboard Stats
        Web->>API: GET /admin/statistics/dashboard
        API->>Stats: getAdminDashboardStats()
        
        Note over Stats,DB: Aggregate data from multiple sources
        
        Stats->>DB: Query financial overview
        DB-->>Stats: Wallet balances, fees, revenue
        
        Stats->>DB: Query transaction stats
        DB-->>Stats: Transaction counts by type
        
        Stats->>DB: Query fraud stats
        DB-->>Stats: Fraud flags count
        
        Stats-->>API: Complete dashboard statistics
        API-->>Web: {financial, fraud, transactions}
    
    and Fetch Time Series Data
        Web->>API: GET /accounts (last 1000 users)
        API->>DB: SELECT * FROM accounts<br/>ORDER BY created_at DESC<br/>LIMIT 1000
        DB-->>API: Users array
        API-->>Web: Users data
        
        Web->>API: GET /posts/admin/all (last 1000 posts)
        API->>DB: SELECT * FROM posts<br/>ORDER BY created_at DESC<br/>LIMIT 1000
        DB-->>API: Posts array
        API-->>Web: Posts data
        
        Web->>Web: Group by date (last 7 days)
        Web->>Web: Calculate time series
    
    and Fetch Recent Users
        Web->>API: GET /accounts?limit=10
        API->>DB: SELECT * FROM accounts<br/>ORDER BY created_at DESC<br/>LIMIT 10
        DB-->>API: Recent users
        API-->>Web: Users array
    
    and Fetch Recent Posts
        Web->>API: GET /posts/admin/all?limit=10
        API->>DB: SELECT * FROM posts<br/>ORDER BY created_at DESC<br/>LIMIT 10
        DB-->>API: Recent posts
        API-->>Web: Posts array
    
    and Fetch Post Counts
        Web->>API: GET /posts/count
        API->>DB: SELECT COUNT(*) FROM posts
        DB-->>API: Total posts
        API-->>Web: {count: 1234}
        
        Web->>API: GET /posts/count?status=PUBLISHED
        API->>DB: SELECT COUNT(*) FROM posts<br/>WHERE status = 'PUBLISHED'
        DB-->>API: Published count
        API-->>Web: {count: 890}
        
        Web->>API: GET /posts/count?status=PENDING_REVIEW
        API->>DB: SELECT COUNT(*) FROM posts<br/>WHERE status = 'PENDING_REVIEW'
        DB-->>API: Pending count
        API-->>Web: {count: 45}
    
    and Fetch Account Counts
        Web->>API: GET /accounts/count?status=active
        API->>DB: SELECT COUNT(*) FROM accounts<br/>WHERE is_banned = false
        DB-->>API: Active users
        API-->>Web: {count: 567}
        
        Web->>API: GET /accounts/count?status=banned
        API->>DB: SELECT COUNT(*) FROM accounts<br/>WHERE is_banned = true
        DB-->>API: Banned users
        API-->>Web: {count: 8}
    end
    
    Note over Web: All data loaded, render dashboard
    
    Web->>Admin: Display complete dashboard<br/>with stats, charts, and tables
    
    Note over Web: Auto-refresh every 30 seconds
```

---

## 2. Financial Statistics Workflow

### Data Flow Diagram

```mermaid
graph LR
    A[Financial Overview API] --> B[Get Total Wallet Balance]
    A --> C[Get Total Topup Amount]
    A --> D[Get Total Fees Collected]
    A --> E[Calculate Net Revenue]
    
    B --> B1[(wallets table)]
    B1 --> B2[SUM balance]
    
    C --> C1[(wallet_transactions)]
    C1 --> C2[Filter: service_type=WALLET_TOPUP]
    C2 --> C3[SUM amount WHERE amount > 0]
    
    D --> D1[Get Post Payment Fees]
    D --> D2[Get Verification Fees]
    
    D1 --> D1a[(post_payments)]
    D1a --> D1b[SUM amount_paid]
    
    D2 --> D2a[(wallet_transactions)]
    D2a --> D2b[Filter: service_type=POST_VERIFICATION]
    D2b --> D2c[SUM ABS amount WHERE amount < 0]
    
    E --> E1[Total Fees - Total Refunds]
    E1 --> E2[Net Revenue]
```

### API Call Example

```mermaid
sequenceDiagram
    participant Admin as 👨‍💼 Admin
    participant Web as 🌐 Dashboard
    participant API as 🔧 Statistics API
    participant DB as 🗄️ Database

    Admin->>Web: View financial stats
    Web->>API: GET /admin/statistics/financial
    
    API->>DB: Query 1: Get total wallet balance
    Note over DB: SELECT SUM(CAST(balance AS DECIMAL))<br/>FROM wallets
    DB-->>API: totalWalletBalance: "15,500,000"
    
    API->>DB: Query 2: Get total topup amount
    Note over DB: SELECT SUM(CAST(amount AS DECIMAL))<br/>FROM wallet_transactions wt<br/>JOIN service_types st<br/>WHERE st.code = 'WALLET_TOPUP'<br/>AND CAST(amount AS DECIMAL) > 0
    DB-->>API: totalTopupAmount: "20,000,000"
    
    API->>DB: Query 3: Get total post payment fees
    Note over DB: SELECT SUM(CAST(amount_paid AS DECIMAL))<br/>FROM post_payments
    DB-->>API: totalDepositCollected: "3,200,000"
    
    API->>DB: Query 4: Get total verification fees
    Note over DB: SELECT SUM(ABS(CAST(amount AS DECIMAL)))<br/>FROM wallet_transactions wt<br/>JOIN service_types st<br/>WHERE st.code = 'POST_VERIFICATION'<br/>AND CAST(amount AS DECIMAL) < 0
    DB-->>API: totalVerificationFees: "850,000"
    
    API->>DB: Query 5: Get total refund amount
    Note over DB: SELECT SUM(CAST(amount_refund AS DECIMAL))<br/>FROM refund_cases<br/>WHERE status = 'REFUNDED'
    DB-->>API: totalRefundAmount: "0"
    
    Note over API: Calculate derived metrics
    API->>API: totalFeesCollected = <br/>depositCollected + verificationFees
    API->>API: netRevenue = <br/>totalFeesCollected - totalRefundAmount
    
    API-->>Web: FinancialOverview DTO
    Web->>Admin: Display financial cards
```

---

## 3. Transaction Statistics Workflow

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin as 👨‍💼 Admin
    participant Web as 🌐 Dashboard
    participant API as 🔧 API Backend
    participant DB as 🗄️ Database

    Admin->>Web: View transaction stats
    Web->>API: GET /admin/statistics/transactions
    
    Note over API,DB: Count all transaction types
    
    API->>DB: Count total wallet transactions
    Note over DB: SELECT COUNT(*) FROM wallet_transactions
    DB-->>API: totalTransactions: 1523
    
    API->>DB: Count transactions today
    Note over DB: SELECT COUNT(*) FROM wallet_transactions<br/>WHERE DATE(created_at) = CURRENT_DATE
    DB-->>API: transactionsToday: 45
    
    API->>DB: Count POST_PAYMENT transactions
    Note over DB: SELECT COUNT(*) FROM post_payments
    DB-->>API: totalPostPayments: 234
    
    API->>DB: Count WALLET_TOPUP transactions
    Note over DB: SELECT COUNT(*) FROM wallet_transactions wt<br/>JOIN service_types st<br/>WHERE st.code = 'WALLET_TOPUP'
    DB-->>API: totalTopups: 189
    
    API->>DB: Count POST_VERIFICATION transactions
    Note over DB: SELECT COUNT(*) FROM wallet_transactions wt<br/>JOIN service_types st<br/>WHERE st.code = 'POST_VERIFICATION'
    DB-->>API: totalVerifications: 67
    
    API-->>Web: TransactionStats DTO
    Web->>Admin: Display transaction metrics
```

---

## 4. Dashboard Data Aggregation

### Complete Statistics DTO Structure

```typescript
interface AdminDashboardStatistics {
  financial: {
    totalWalletBalance: string;        // Sum of all user wallets
    totalTopupAmount: string;          // Total money added via PayOS
    totalWithdrawalAmount: string;     // Total money withdrawn (future)
    totalTransactions: number;         // Count all wallet transactions
    totalFeesCollected: string;        // Post fees + Verification fees
    totalDepositCollected: string;     // Post payment fees only
    totalVerificationFees: string;     // Verification fees only
    totalRefundAmount: string;         // Total refunds issued
    netRevenue: string;                // Fees - Refunds
  };
  
  fraud: {
    totalFraudFlags: number;           // Count fraud flags
    suspectedCount: number;            // Suspected fraud
    confirmedCount: number;            // Confirmed fraud
    refundRate: number;                // Refund % (currently 0)
    totalRefundedPosts: number;        // Posts with refunds
  };
  
  transactions: {
    totalTransactions: number;         // All wallet transactions
    transactionsToday: number;         // Today's transactions
    totalPostPayments: number;         // Post payment count
    totalTopups: number;               // Topup count
    totalVerifications: number;        // Verification count
  };
}
```

### Key Metrics Calculation

```mermaid
graph TD
    A[Admin Dashboard] --> B[Financial Metrics]
    A --> C[Transaction Metrics]
    A --> D[User Metrics]
    A --> E[Post Metrics]
    
    B --> B1[Total Wallet Balance<br/>SUM wallets.balance]
    B --> B2[Total Topup<br/>SUM wallet_transactions<br/>WHERE type=TOPUP]
    B --> B3[Total Fees<br/>SUM post_payments +<br/>SUM verification fees]
    B --> B4[Net Revenue<br/>Fees - Refunds]
    
    C --> C1[Total Transactions<br/>COUNT wallet_transactions]
    C --> C2[Transactions Today<br/>COUNT WHERE date=today]
    C --> C3[Post Payments<br/>COUNT post_payments]
    C --> C4[Topups<br/>COUNT WHERE type=TOPUP]
    
    D --> D1[Total Users<br/>COUNT accounts]
    D --> D2[Active Users<br/>COUNT WHERE is_banned=false]
    D --> D3[New Users Today<br/>COUNT WHERE date=today]
    D --> D4[Banned Users<br/>COUNT WHERE is_banned=true]
    
    E --> E1[Total Posts<br/>COUNT posts]
    E --> E2[Published Posts<br/>COUNT WHERE status=PUBLISHED]
    E --> E3[Pending Posts<br/>COUNT WHERE status=PENDING]
    E --> E4[Posts by Type<br/>COUNT GROUP BY post_type]
```

---

## 5. Real-time Updates & Caching

### React Query Strategy

```mermaid
graph LR
    A[Dashboard Page] --> B[React Query]
    
    B --> C[Dashboard Stats Query]
    B --> D[Time Series Query]
    B --> E[Recent Users Query]
    B --> F[Recent Posts Query]
    B --> G[Financial Stats Query]
    
    C --> C1[Refetch: 30s]
    C --> C2[Stale Time: 10s]
    
    D --> D1[Refetch: 60s]
    D --> D2[Stale Time: 30s]
    
    E --> E1[Refetch: 30s]
    E --> E2[Stale Time: 10s]
    
    F --> F1[Refetch: 30s]
    F --> F2[Stale Time: 10s]
    
    G --> G1[Refetch: 30s]
    G --> G2[Stale Time: 10s]
```

### Query Configuration

```typescript
// Dashboard stats - refresh every 30s
const { data: stats } = useQuery({
  queryKey: ['admin-dashboard-stats'],
  queryFn: getDashboardStats,
  refetchInterval: 30000,
  staleTime: 10000,
});

// Financial stats - refresh every 30s
const { data: adminStats } = useQuery({
  queryKey: ['admin-dashboard-statistics'],
  queryFn: getAdminDashboardStatistics,
  refetchInterval: 30000,
  staleTime: 10000,
});

// Time series - refresh every 60s
const { data: timeSeriesData } = useQuery({
  queryKey: ['admin-dashboard-timeseries'],
  queryFn: () => getTimeSeriesData(7), // Last 7 days
  refetchInterval: 60000,
  staleTime: 30000,
});

// Recent users - refresh every 30s
const { data: recentUsers } = useQuery({
  queryKey: ['admin-recent-users'],
  queryFn: () => getRecentUsers(10),
  refetchInterval: 30000,
  staleTime: 10000,
});

// Recent posts - refresh every 30s
const { data: recentPosts } = useQuery({
  queryKey: ['admin-recent-posts'],
  queryFn: () => getRecentPosts(10),
  refetchInterval: 30000,
  staleTime: 10000,
});
```

---

## 6. Charts & Visualization

### Time Series Data Processing

```mermaid
sequenceDiagram
    participant Web as Dashboard
    participant API as Backend API
    participant DB as Database
    
    Web->>API: GET /accounts?limit=1000
    API->>DB: Fetch recent 1000 users
    DB-->>API: Users array
    API-->>Web: Users data
    
    Web->>API: GET /posts/admin/all?limit=1000
    API->>DB: Fetch recent 1000 posts
    DB-->>API: Posts array
    API-->>Web: Posts data
    
    Note over Web: Client-side processing
    
    Web->>Web: Filter last 7 days data
    Web->>Web: Group by date
    
    loop For each day in last 7 days
        Web->>Web: Count users created on this day
        Web->>Web: Count posts created on this day
        Web->>Web: Store in timeSeriesData array
    end
    
    Web->>Web: Render LineChart component
```

### Chart Types

**1. User Growth Chart (Line Chart)**
- X-axis: Date (last 7 days)
- Y-axis: Number of new users
- Data: Users grouped by `created_at` date

**2. Post Growth Chart (Line Chart)**
- X-axis: Date (last 7 days)
- Y-axis: Number of new posts
- Data: Posts grouped by `created_at` date

**3. Post Status Distribution (Pie Chart)**
- Segments: DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, PAUSED, SOLD, ARCHIVED
- Values: Count of posts for each status

**4. Post Type Distribution (Bar Chart)**
- X-axis: Post type (EV_CAR, EV_BIKE, BATTERY)
- Y-axis: Count of posts
- Data: Posts grouped by `post_type`

---

## 7. API Endpoints Summary

### Dashboard Statistics Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/statistics/dashboard` | GET | Complete dashboard stats (all-in-one) |
| `/admin/statistics/financial` | GET | Financial overview only |
| `/admin/statistics/transactions` | GET | Transaction statistics only |
| `/admin/statistics/fraud` | GET | Fraud & risk statistics |
| `/admin/statistics/wallet-balance` | GET | Total wallet balance |
| `/admin/statistics/total-topup` | GET | Total topup amount |
| `/admin/statistics/total-deposit` | GET | Total deposit collected |
| `/admin/statistics/total-revenue` | GET | Total revenue (fees - refunds) |

### Count Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/accounts/count` | GET | Count all accounts |
| `/accounts/count?status=active` | GET | Count active accounts |
| `/accounts/count?status=banned` | GET | Count banned accounts |
| `/posts/count` | GET | Count all posts |
| `/posts/count?status=PUBLISHED` | GET | Count published posts |
| `/posts/count?status=PENDING_REVIEW` | GET | Count pending posts |

### List Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/accounts?limit=10` | GET | Get recent 10 users |
| `/posts/admin/all?limit=10` | GET | Get recent 10 posts |
| `/posts/admin/all?status=PENDING_REVIEW&limit=50` | GET | Get pending posts for review |

---

## 8. Database Queries for Statistics

### Financial Queries

```sql
-- Total Wallet Balance
SELECT SUM(CAST(balance AS DECIMAL)) AS total_balance
FROM wallets;

-- Total Topup Amount
SELECT SUM(CAST(wt.amount AS DECIMAL)) AS total_topup
FROM wallet_transactions wt
JOIN service_types st ON wt.service_type_id = st.id
WHERE st.code = 'WALLET_TOPUP'
  AND CAST(wt.amount AS DECIMAL) > 0;

-- Total Post Payment Fees
SELECT SUM(CAST(amount_paid AS DECIMAL)) AS total_deposit
FROM post_payments;

-- Total Verification Fees
SELECT SUM(ABS(CAST(wt.amount AS DECIMAL))) AS total_verification_fees
FROM wallet_transactions wt
JOIN service_types st ON wt.service_type_id = st.id
WHERE st.code = 'POST_VERIFICATION'
  AND CAST(wt.amount AS DECIMAL) < 0;

-- Total Refunds
SELECT SUM(CAST(amount_refund AS DECIMAL)) AS total_refunds
FROM refund_cases
WHERE status = 'REFUNDED';

-- Net Revenue
SELECT 
  (SELECT SUM(CAST(amount_paid AS DECIMAL)) FROM post_payments) +
  (SELECT SUM(ABS(CAST(wt.amount AS DECIMAL))) 
   FROM wallet_transactions wt
   JOIN service_types st ON wt.service_type_id = st.id
   WHERE st.code = 'POST_VERIFICATION' AND CAST(wt.amount AS DECIMAL) < 0) -
  (SELECT COALESCE(SUM(CAST(amount_refund AS DECIMAL)), 0) FROM refund_cases WHERE status = 'REFUNDED')
AS net_revenue;
```

### Transaction Queries

```sql
-- Total Transactions
SELECT COUNT(*) AS total_transactions
FROM wallet_transactions;

-- Transactions Today
SELECT COUNT(*) AS transactions_today
FROM wallet_transactions
WHERE DATE(created_at) = CURRENT_DATE;

-- Post Payments Count
SELECT COUNT(*) AS total_post_payments
FROM post_payments;

-- Topups Count
SELECT COUNT(*) AS total_topups
FROM wallet_transactions wt
JOIN service_types st ON wt.service_type_id = st.id
WHERE st.code = 'WALLET_TOPUP';

-- Verifications Count
SELECT COUNT(*) AS total_verifications
FROM wallet_transactions wt
JOIN service_types st ON wt.service_type_id = st.id
WHERE st.code = 'POST_VERIFICATION';
```

### User & Post Queries

```sql
-- Total Users
SELECT COUNT(*) AS total_users FROM accounts;

-- Active Users
SELECT COUNT(*) AS active_users
FROM accounts
WHERE is_banned = false;

-- Banned Users
SELECT COUNT(*) AS banned_users
FROM accounts
WHERE is_banned = true;

-- Total Posts
SELECT COUNT(*) AS total_posts FROM posts;

-- Published Posts
SELECT COUNT(*) AS published_posts
FROM posts
WHERE status = 'PUBLISHED';

-- Pending Posts
SELECT COUNT(*) AS pending_posts
FROM posts
WHERE status = 'PENDING_REVIEW';

-- Posts by Type
SELECT 
  post_type,
  COUNT(*) AS count
FROM posts
GROUP BY post_type;

-- Posts by Status
SELECT 
  status,
  COUNT(*) AS count
FROM posts
GROUP BY status;
```

---

## 9. Performance Optimization

### Query Optimization Strategies

1. **Indexing**
```sql
-- Indexes for fast counting
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_accounts_is_banned ON accounts(is_banned);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_wallet_transactions_service_type ON wallet_transactions(service_type_id);
```

2. **Caching Strategy**
- **React Query**: Client-side caching with 30s refetch interval
- **Backend Caching** (optional): Redis for count queries (5-minute TTL)
- **Database Views** (optional): Materialized views for complex aggregations

3. **Pagination**
- Use `LIMIT` and `OFFSET` for large datasets
- Current implementation: Fetch last 1000 records for time series
- Consider server-side pagination for large dashboards

4. **Parallel Queries**
- Frontend: Use `Promise.all()` for parallel API calls
- Backend: Use TypeORM's parallel query execution
- React Query: Automatic parallel queries with separate keys

---

## 10. Testing & Monitoring

### Testing Checklist

**Unit Tests:**
- [ ] Financial calculations are correct
- [ ] Count queries return accurate numbers
- [ ] Time series grouping works properly
- [ ] Error handling for missing data

**Integration Tests:**
- [ ] All API endpoints return expected data
- [ ] Queries execute within performance limits (< 1s)
- [ ] Concurrent requests don't cause race conditions

**E2E Tests:**
- [ ] Dashboard loads all data successfully
- [ ] Charts render correctly
- [ ] Real-time updates work as expected
- [ ] Error states display properly

### Monitoring Metrics

- **API Response Time**: Target < 1 second
- **Database Query Time**: Target < 500ms
- **Cache Hit Rate**: Target > 80% (if caching implemented)
- **Dashboard Load Time**: Target < 3 seconds
- **Auto-refresh Success Rate**: Target > 99%

---

## Summary

### Implemented Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Dashboard Stats** | ✅ Implemented | User, post, and transaction counts |
| **Financial Overview** | ✅ Implemented | Wallet balance, fees, revenue tracking |
| **Time Series Charts** | ✅ Implemented | User & post growth over 7 days |
| **Distribution Charts** | ✅ Implemented | Post status & type distribution |
| **Recent Data Tables** | ✅ Implemented | Recent users and posts |
| **Real-time Updates** | ✅ Implemented | Auto-refresh every 30-60s |
| **Transaction Stats** | ✅ Implemented | Transaction counts by type |
| **Fraud Detection** | ⚠️ Placeholder | Returns 0 (fraud detection removed) |

### Key Technologies

- **Frontend**: Next.js, React Query, Recharts (for charts)
- **Backend**: NestJS, TypeORM
- **Database**: PostgreSQL with aggregate queries
- **Caching**: React Query client-side caching

### Database Tables Used

- `accounts` - User statistics
- `posts` - Post statistics
- `wallets` - Wallet balances
- `wallet_transactions` - Transaction history
- `post_payments` - Post payment tracking
- `service_types` - Service type mapping
- `refund_cases` - Refund tracking
- `post_verification_requests` - Verification stats
