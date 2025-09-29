import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';

// Post base interface
export interface Post {
  id: string;
  postType: 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: object;
  districtNameCached: object;
  wardNameCached: object;
  addressTextCached: object;
  priceVnd: string;
  isNegotiable: boolean;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: object;
  reviewedAt: object;
  seller: {
    id: number;
    email: string;
    phone: string;
    fullName: string;
    avatarUrl: string;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  carDetails?: CarDetails;
  bikeDetails?: BikeDetails;
  batteryDetails?: BatteryDetails;
  createdAt: string;
  updatedAt: string;
}

// Car details interface
export interface CarDetails {
  brand_id: number;
  model_id: number;
  manufacture_year: number;
  body_style: string;
  origin: string;
  color: string;
  seats: number;
  license_plate: string;
  owners_count: number;
  odo_km: number;
  battery_capacity_kwh: number;
  range_km: number;
  charge_ac_kw: number;
  charge_dc_kw: number;
  battery_health_pct: number;
}

// Bike details interface
export interface BikeDetails {
  brand_id: number;
  model_id: number;
  manufacture_year: number;
  bike_style: string;
  origin: string;
  color: string;
  license_plate: string;
  owners_count: number;
  odo_km: number;
  battery_capacity_kwh: number;
  range_km: number;
  motor_power_kw: number;
  charge_ac_kw: number;
  battery_health_pct: number;
}

// Battery details interface
export interface BatteryDetails {
  brand_name: string;
  capacity_kwh: number;
  manufacture_year: number;
  cycles_used: number;
  health_percent: number;
  compatible_models: string[];
}

// Create post DTO
export interface CreatePostDto {
  postType: 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
  title: string;
  description: string;
  wardCode: string;
  addressText: string;
  priceVnd: number;
  isNegotiable: boolean;
  carDetails?: Partial<CarDetails>;
  bikeDetails?: Partial<BikeDetails>;
  batteryDetails?: Partial<BatteryDetails>;
}

// Update post DTO
export interface UpdatePostDto extends Partial<CreatePostDto> {
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Query parameters for getting posts
export interface GetPostsQuery {
  q?: string;
  offset?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
  sort?: string;
  page?: number;
  postType?: 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
  status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

// Response wrapper for paginated results
export interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Create a new post
 * Requires authentication token in headers
 */
export async function createPost(payload: CreatePostDto): Promise<Post> {
  const { data } = await api.post<Post>('/posts', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get posts with optional query parameters
 * Supports filtering, pagination, and search
 */
export async function getPosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.postType) params.append('postType', query.postType);
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<PostsResponse>(`/posts?${params.toString()}`);
  return data;
}

/**
 * Get posts by specific type (car, bike, battery)
 */
export async function getPostsByType(
  postType: 'EV_CAR' | 'EV_BIKE' | 'BATTERY',
  query: Omit<GetPostsQuery, 'postType'> = {},
): Promise<PostsResponse> {
  return getPosts({ ...query, postType });
}

/**
 * Get car posts specifically
 */
export async function getCarPosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  return getPostsByType('EV_CAR', query);
}

/**
 * Get bike posts specifically
 */
export async function getBikePosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  return getPostsByType('EV_BIKE', query);
}

/**
 * Get battery posts specifically
 */
export async function getBatteryPosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  return getPostsByType('BATTERY', query);
}

/**
 * Get a single post by ID
 */
export async function getPostById(id: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/${id}`);
  return data;
}

/**
 * Update a post by ID
 * Requires authentication token in headers
 */
export async function updatePost(id: string, payload: UpdatePostDto): Promise<Post> {
  const { data } = await api.patch<Post>(`/posts/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete a post by ID
 * Requires authentication token in headers
 */
export async function deletePost(id: string): Promise<void> {
  await api.delete(`/posts/${id}`, {
    headers: getAuthHeaders(),
  });
}

/**
 * Get posts by current user
 * Requires authentication token in headers
 */
export async function getMyPosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<PostsResponse>(`/posts/my?${params.toString()}`, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Submit a post for review (change status from DRAFT to PENDING)
 * Requires authentication token in headers
 */
export async function submitPost(id: string): Promise<Post> {
  const { data } = await api.patch<Post>(
    `/posts/${id}/submit`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Approve a post (Admin only)
 * Requires authentication token in headers
 */
export async function approvePost(id: string): Promise<Post> {
  const { data } = await api.patch<Post>(
    `/posts/${id}/approve`,
    {},
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

/**
 * Reject a post (Admin only)
 * Requires authentication token in headers
 */
export async function rejectPost(id: string, reason?: string): Promise<Post> {
  const { data } = await api.patch<Post>(
    `/posts/${id}/reject`,
    { reason },
    {
      headers: getAuthHeaders(),
    },
  );
  return data;
}

// ==================== BIKE SPECIFIC API FUNCTIONS ====================

/**
 * Create a new bike post
 * Requires authentication token in headers
 */
export async function createBikePost(payload: CreatePostDto): Promise<Post> {
  const bikePayload = {
    ...payload,
    postType: 'EV_BIKE' as const,
  };

  const { data } = await api.post<Post>('/posts/bike', bikePayload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get bike posts with query parameters
 * Supports filtering, pagination, and search specifically for bikes
 */
export async function getBikePostsWithQuery(query: GetPostsQuery = {}): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<PostsResponse>(`/posts/bike?${params.toString()}`);
  return data;
}

/**
 * Get a single bike post by ID
 */
export async function getBikePostById(id: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/bike/${id}`);
  return data;
}

/**
 * Update a bike post by ID
 * Requires authentication token in headers
 */
export async function updateBikePost(id: string, payload: UpdatePostDto): Promise<Post> {
  const { data } = await api.patch<Post>(`/posts/bike/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete a bike post by ID
 * Requires authentication token in headers
 */
export async function deleteBikePost(id: string): Promise<void> {
  await api.delete(`/posts/bike/${id}`, {
    headers: getAuthHeaders(),
  });
}

// ==================== CAR SPECIFIC API FUNCTIONS ====================

/**
 * Create a new car post
 * Requires authentication token in headers
 */
export async function createCarPost(payload: CreatePostDto): Promise<Post> {
  const carPayload = {
    ...payload,
    postType: 'EV_CAR' as const,
  };

  const { data } = await api.post<Post>('/posts/car', carPayload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get car posts with query parameters
 * Supports filtering, pagination, and search specifically for cars
 */
export async function getCarPostsWithQuery(query: GetPostsQuery = {}): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<PostsResponse>(`/posts/car?${params.toString()}`);
  return data;
}

/**
 * Get a single car post by ID
 */
export async function getCarPostById(id: string): Promise<Post> {
  const { data } = await api.get<Post>(`/posts/car/${id}`);
  return data;
}

/**
 * Update a car post by ID
 * Requires authentication token in headers
 */
export async function updateCarPost(id: string, payload: UpdatePostDto): Promise<Post> {
  const { data } = await api.patch<Post>(`/posts/car/${id}`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Delete a car post by ID
 * Requires authentication token in headers
 */
export async function deleteCarPost(id: string): Promise<void> {
  await api.delete(`/posts/car/${id}`, {
    headers: getAuthHeaders(),
  });
}
