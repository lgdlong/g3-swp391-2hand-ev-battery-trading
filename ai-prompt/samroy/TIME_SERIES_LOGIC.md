# Logic Chi Tiết: Xu Hướng 7 Ngày Qua

## 📊 Tổng Quan

Biểu đồ **"Xu Hướng 7 Ngày Qua"** hiển thị số lượng **users mới** và **posts mới** được tạo trong 7 ngày gần đây nhất. Đây là Line Chart (biểu đồ đường) cho phép so sánh xu hướng tăng trưởng giữa 2 metrics.

---

## 🔄 Flow Tổng Thể

```
Dashboard Page (page.tsx)
    ↓
React Query: getTimeSeriesData(7)
    ↓
Fetch ALL users & posts from database
    ↓
Process & Filter data by date ranges
    ↓
Return array of 7 data points
    ↓
DashboardCharts Component
    ↓
Recharts LineChart renders
```

---

## 📝 Chi Tiết Từng Bước

### Bước 1: Fetch Data (Dashboard Page)

**File**: `apps/web/app/(dashboard)/admin/page.tsx`

```typescript
const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
  queryKey: ['admin-dashboard-timeseries'],
  queryFn: () => getTimeSeriesData(7), // Last 7 days
  refetchInterval: 60000, // Refetch mỗi 60 giây
  staleTime: 30000, // Dữ liệu fresh trong 30 giây
});
```

**Giải thích:**

- ✅ Sử dụng **React Query** để fetch data tự động
- ✅ Gọi function `getTimeSeriesData(7)` để lấy data 7 ngày
- ✅ Auto-refresh mỗi **60 giây** để có data real-time
- ✅ Cache data trong **30 giây** để giảm API calls

---

### Bước 2: Process Data (adminApi.ts)

**File**: `apps/web/lib/api/adminApi.ts`

#### 2.1. Fetch Toàn Bộ Data

```typescript
const [accountsRes, postsRes] = await Promise.all([
  api.get<Account[]>('/accounts', { headers: getAuthHeaders() }),
  api.get<Post[]>('/posts/admin/all', { headers: getAuthHeaders() }),
]);

const accounts = accountsRes.data; // Tất cả users
const posts = postsRes.data; // Tất cả posts
```

**Giải thích:**

- ✅ Dùng `Promise.all()` để fetch parallel (nhanh hơn)
- ✅ Lấy **TOÀN BỘ** users và posts từ database
- ✅ Kèm JWT token trong headers để authenticate

---

#### 2.2. Generate Date Range (7 ngày)

```typescript
const dateRange: TimeSeriesData[] = [];
const today = new Date();

// Loop ngược từ 6 ngày trước → hôm nay
for (let i = days - 1; i >= 0; i--) {
  const date = new Date(today);
  date.setDate(date.getDate() - i); // Lùi lại i ngày
  date.setHours(0, 0, 0, 0); // Set về 00:00:00

  // Date range: [date, nextDate)
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1); // Ngày kế tiếp

  // ...
}
```

**Ví dụ cụ thể** (giả sử hôm nay là 12/10/2025):

```
i = 6: date = 06/10/2025 00:00:00, nextDate = 07/10/2025 00:00:00
i = 5: date = 07/10/2025 00:00:00, nextDate = 08/10/2025 00:00:00
i = 4: date = 08/10/2025 00:00:00, nextDate = 09/10/2025 00:00:00
i = 3: date = 09/10/2025 00:00:00, nextDate = 10/10/2025 00:00:00
i = 2: date = 10/10/2025 00:00:00, nextDate = 11/10/2025 00:00:00
i = 1: date = 11/10/2025 00:00:00, nextDate = 12/10/2025 00:00:00
i = 0: date = 12/10/2025 00:00:00, nextDate = 13/10/2025 00:00:00 (hôm nay)
```

**Tại sao loop ngược?**

- ✅ Để data được sắp xếp từ **cũ → mới** (left to right trên chart)
- ✅ i = 6: 6 ngày trước
- ✅ i = 0: hôm nay

---

#### 2.3. Filter Users & Posts Theo Ngày

```typescript
// Đếm số users được tạo trong khoảng [date, nextDate)
const usersCount = accounts.filter((a) => {
  const createdAt = new Date(a.createdAt);
  return createdAt >= date && createdAt < nextDate;
}).length;

// Đếm số posts được tạo trong khoảng [date, nextDate)
const postsCount = posts.filter((p) => {
  const createdAt = new Date(p.createdAt);
  return createdAt >= date && createdAt < nextDate;
}).length;
```

**Giải thích:**

- ✅ Filter theo `createdAt` field từ database
- ✅ Điều kiện: `createdAt >= date AND createdAt < nextDate`
- ✅ Tính số lượng bằng `.length`

**Ví dụ:**

```
Date: 10/10/2025 00:00:00 → 11/10/2025 00:00:00

Users với createdAt:
- 09/10/2025 23:59:59 ❌ (< date)
- 10/10/2025 00:00:00 ✅ (>= date)
- 10/10/2025 12:30:00 ✅ (trong khoảng)
- 10/10/2025 23:59:59 ✅ (< nextDate)
- 11/10/2025 00:00:00 ❌ (>= nextDate)

→ usersCount = 3
```

---

#### 2.4. Build Result Object

```typescript
dateRange.push({
  date: dateStr, // "2025-10-10"
  users: usersCount, // 3
  posts: postsCount, // 15
  bookmarks: 0, // TODO: chưa có API
});
```

**Kết quả cuối cùng** (ví dụ):

```json
[
  { "date": "2025-10-06", "users": 5, "posts": 12, "bookmarks": 0 },
  { "date": "2025-10-07", "users": 3, "posts": 8, "bookmarks": 0 },
  { "date": "2025-10-08", "users": 7, "posts": 20, "bookmarks": 0 },
  { "date": "2025-10-09", "users": 2, "posts": 5, "bookmarks": 0 },
  { "date": "2025-10-10", "users": 10, "posts": 25, "bookmarks": 0 },
  { "date": "2025-10-11", "users": 4, "posts": 15, "bookmarks": 0 },
  { "date": "2025-10-12", "users": 6, "posts": 18, "bookmarks": 0 }
]
```

---

### Bước 3: Render Chart (DashboardCharts.tsx)

**File**: `apps/web/app/(dashboard)/admin/_components/DashboardCharts.tsx`

```typescript
<LineChart data={timeSeriesData}>
  {/* Grid nền */}
  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

  {/* Trục X (ngày tháng) */}
  <XAxis
    dataKey="date"
    tickFormatter={(value) => {
      const date = new Date(value);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }}
  />

  {/* Trục Y (số lượng) */}
  <YAxis stroke="#9ca3af" />

  {/* Tooltip khi hover */}
  <Tooltip />

  {/* Legend (chú thích) */}
  <Legend />

  {/* Đường màu xanh dương: Users */}
  <Line
    type="monotone"
    dataKey="users"
    stroke={COLORS.blue}
    name="Users Mới"
    strokeWidth={2}
    dot={{ r: 4 }}
  />

  {/* Đường màu xanh lá: Posts */}
  <Line
    type="monotone"
    dataKey="posts"
    stroke={COLORS.green}
    name="Posts Mới"
    strokeWidth={2}
    dot={{ r: 4 }}
  />
</LineChart>
```

**Giải thích các thành phần:**

1. **CartesianGrid**: Lưới nền giúp đọc giá trị dễ hơn
2. **XAxis**: Trục ngang hiển thị ngày (6/10, 7/10, ...)
3. **YAxis**: Trục dọc hiển thị số lượng (0, 5, 10, 15, ...)
4. **Tooltip**: Hiển thị thông tin chi tiết khi hover chuột
5. **Legend**: Chú thích màu sắc (Users Mới, Posts Mới)
6. **Line (users)**: Đường màu xanh dương biểu diễn users
7. **Line (posts)**: Đường màu xanh lá biểu diễn posts

---

## 🎯 Ví Dụ Minh Họa

### Scenario: Hôm nay là 12/10/2025

#### Input Data từ Database:

**Users:**

```
ID  | fullName | createdAt
----|----------|------------------
1   | John     | 2025-10-06 10:30
2   | Alice    | 2025-10-07 14:20
3   | Bob      | 2025-10-07 16:45
4   | Carol    | 2025-10-10 08:00
5   | Dave     | 2025-10-10 12:30
6   | Eve      | 2025-10-10 20:15
7   | Frank    | 2025-10-12 09:00
```

**Posts:**

```
ID  | title      | createdAt
----|------------|------------------
1   | Post A     | 2025-10-06 11:00
2   | Post B     | 2025-10-07 15:30
3   | Post C     | 2025-10-08 10:20
4   | Post D     | 2025-10-10 13:45
5   | Post E     | 2025-10-12 08:30
```

#### Processing:

```
06/10: 1 user (John), 1 post (Post A)
07/10: 2 users (Alice, Bob), 1 post (Post B)
08/10: 0 users, 1 post (Post C)
09/10: 0 users, 0 posts
10/10: 3 users (Carol, Dave, Eve), 1 post (Post D)
11/10: 0 users, 0 posts
12/10: 1 user (Frank), 1 post (Post E)
```

#### Output Data:

```json
[
  { "date": "2025-10-06", "users": 1, "posts": 1 },
  { "date": "2025-10-07", "users": 2, "posts": 1 },
  { "date": "2025-10-08", "users": 0, "posts": 1 },
  { "date": "2025-10-09", "users": 0, "posts": 0 },
  { "date": "2025-10-10", "users": 3, "posts": 1 },
  { "date": "2025-10-11", "users": 0, "posts": 0 },
  { "date": "2025-10-12", "users": 1, "posts": 1 }
]
```

#### Chart Visualization:

```
Users |
  3   |              *
      |
  2   |    *
      |
  1   | *              *     *
      |
  0   |____*___*_______*____*___
      6   7   8   9  10  11  12

Posts |
  1   | *  *  *        *     *
      |
  0   |______*___*_______*______
      6   7   8   9  10  11  12
```

---

## 🔧 Performance & Optimization

### Vấn Đề Hiện Tại:

❌ **Fetch TOÀN BỘ users & posts** mỗi lần

- Nếu có 10,000 users và 50,000 posts → rất chậm
- Lãng phí bandwidth
- Client phải filter toàn bộ data

### Giải Pháp Tối Ưu (Nên làm trong tương lai):

✅ **Backend API nên filter sẵn:**

```typescript
GET /api/analytics/timeseries?days=7

// Backend chỉ trả về data đã được aggregate
Response:
[
  { "date": "2025-10-06", "usersCount": 1, "postsCount": 1 },
  { "date": "2025-10-07", "usersCount": 2, "postsCount": 1 },
  ...
]
```

✅ **Lợi ích:**

- Faster response time
- Less data transfer
- More accurate với SQL aggregation
- Scalable khi data lớn

### SQL Query Tối Ưu (Gợi ý cho Backend):

```sql
-- Count users per day (last 7 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as users_count
FROM accounts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;

-- Count posts per day (last 7 days)
SELECT
  DATE(created_at) as date,
  COUNT(*) as posts_count
FROM posts
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

---

## 📊 Data Structure

### TimeSeriesData Interface:

```typescript
export interface TimeSeriesData {
  date: string; // ISO date string: "2025-10-12"
  users: number; // Số users mới trong ngày
  posts: number; // Số posts mới trong ngày
  bookmarks: number; // TODO: chưa implement
}
```

---

## 🎨 Customization

### Thay đổi số ngày:

```typescript
// 7 ngày (hiện tại)
queryFn: () => getTimeSeriesData(7);

// 14 ngày
queryFn: () => getTimeSeriesData(14);

// 30 ngày
queryFn: () => getTimeSeriesData(30);
```

### Thay đổi màu sắc:

```typescript
// File: DashboardCharts.tsx
const COLORS = {
  blue: '#3b82f6', // Users → đổi thành màu khác
  green: '#10b981', // Posts → đổi thành màu khác
};
```

### Thay đổi refresh interval:

```typescript
// File: page.tsx
refetchInterval: 60000, // 60 giây (hiện tại)
refetchInterval: 30000, // 30 giây (nhanh hơn)
refetchInterval: 120000, // 2 phút (chậm hơn)
```

---

## 🐛 Edge Cases & Handling

### 1. Không có data:

```typescript
// Nếu không có users/posts trong ngày
{ "date": "2025-10-09", "users": 0, "posts": 0 }
// → Chart sẽ hiển thị điểm ở y = 0
```

### 2. API Error:

```typescript
// React Query tự động handle
if (timeSeriesError) {
  // Show error message trong UI
  return <ErrorComponent />;
}
```

### 3. Loading State:

```typescript
if (timeSeriesLoading) {
  // Show skeleton loader
  return <LoadingSkeleton />;
}
```

---

## 📈 Use Cases

### Admin có thể:

1. ✅ Xem xu hướng tăng trưởng users/posts theo ngày
2. ✅ So sánh giữa users và posts (có correlation không?)
3. ✅ Phát hiện spike (tăng đột ngột) → điều tra nguyên nhân
4. ✅ Phát hiện drop (giảm đột ngột) → có vấn đề?
5. ✅ Đánh giá hiệu quả của marketing campaigns

### Ví dụ insights:

- "Posts tăng mạnh vào 10/10 nhưng users không tăng → Users cũ đang active"
- "Users tăng vào cuối tuần → Có thể do ads campaign"
- "Cả users và posts đều giảm → Cần kiểm tra hệ thống"

---

## 🔮 Future Enhancements

1. **More Metrics**:
   - Bookmarks per day
   - Views per day
   - Revenue per day (nếu có monetization)

2. **Date Range Selector**:
   - User chọn 7/14/30/90 ngày
   - Custom date range picker

3. **Comparison**:
   - So sánh với tuần trước
   - So sánh với tháng trước
   - Year-over-year comparison

4. **Export Data**:
   - Download as CSV
   - Download as PDF report

5. **Real-time Updates**:
   - WebSocket cho real-time updates
   - Live counter animation

---

## 📝 Summary

### Logic Tóm Tắt:

1. **Fetch** toàn bộ users & posts từ DB
2. **Loop** 7 lần (từ 6 ngày trước → hôm nay)
3. **Filter** users & posts theo từng ngày
4. **Count** số lượng
5. **Build** array of data points
6. **Render** LineChart với Recharts
7. **Auto-refresh** mỗi 60 giây

### Key Points:

- ✅ Simple nhưng hiệu quả cho prototype
- ⚠️ Không scalable với data lớn
- 🎯 Dễ customize và extend
- 📊 Cung cấp insights valuable cho admin

---

**Created**: October 12, 2025  
**Author**: Development Team  
**Related Files**:

- `apps/web/lib/api/adminApi.ts`
- `apps/web/app/(dashboard)/admin/page.tsx`
- `apps/web/app/(dashboard)/admin/_components/DashboardCharts.tsx`
