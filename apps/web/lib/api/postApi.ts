import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import { DEFAULT_API_BASE_URL } from '@/config/constants';

// Type for fields that can be string, number, object, or null based on API response
type FlexibleField = string | number | object | null;

// Post base interface
export interface Post {
  id: string;
  postType: 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
  title: string;
  description: string;
  wardCode: string;
  provinceNameCached: FlexibleField;
  districtNameCached: FlexibleField;
  wardNameCached: FlexibleField;
  addressTextCached: FlexibleField;
  priceVnd: string;
  isNegotiable: boolean;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'PAUSED' | 'SOLD' | 'ARCHIVED';
  submittedAt: FlexibleField;
  reviewedAt: FlexibleField;
  seller: {
    id: number;
    email: string;
    phone: string | null;
    fullName: string;
    avatarUrl: string | null;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  carDetails?: CarDetails;
  bikeDetails?: BikeDetails;
  batteryDetails?: BatteryDetails;
  images: FlexibleField[];
  createdAt: string;
  updatedAt: string;
}

// Car details interface
export interface CarDetails {
  brand_id: FlexibleField;
  model_id: FlexibleField;
  manufacture_year: FlexibleField;
  body_style: string;
  origin: string;
  color: string;
  seats: FlexibleField;
  license_plate: FlexibleField;
  owners_count: FlexibleField;
  odo_km: FlexibleField;
  battery_capacity_kwh: FlexibleField;
  range_km: FlexibleField;
  charge_ac_kw: FlexibleField;
  charge_dc_kw: FlexibleField;
  battery_health_pct: FlexibleField;
}

// Bike details interface
export interface BikeDetails {
  brand_id: FlexibleField;
  model_id: FlexibleField;
  manufacture_year: FlexibleField;
  bike_style: string;
  origin: string;
  color: string;
  license_plate: FlexibleField;
  owners_count: FlexibleField;
  odo_km: FlexibleField;
  battery_capacity_kwh: FlexibleField;
  range_km: FlexibleField;
  motor_power_kw: FlexibleField;
  charge_ac_kw: FlexibleField;
  battery_health_pct: FlexibleField;
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

// Create car post DTO (specific for car creation)
export interface CreateCarPostDto {
  postType: 'EV_CAR';
  carDetails: {
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
  };
}

// Create bike post DTO (specific for bike creation)
export interface CreateBikePostDto {
  postType: 'EV_BIKE';
  bikeDetails: {
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
  };
}

// Update post DTO
export interface UpdatePostDto extends Partial<CreatePostDto> {
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'PAUSED' | 'SOLD' | 'ARCHIVED';
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
  status?: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'PAUSED' | 'SOLD' | 'ARCHIVED' | 'ALL';
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
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.sort) params.append('sort', query.sort);

  try {
    // Fetch car posts
    const carResponse = await api.get<Post[]>(`/posts/car?${params.toString()}`);
    const carPosts = Array.isArray(carResponse.data) ? carResponse.data : [];

    // Fetch bike posts  
    const bikeResponse = await api.get<Post[]>(`/posts/bike?${params.toString()}`);
    const bikePosts = Array.isArray(bikeResponse.data) ? bikeResponse.data : [];

    // Combine and filter by status if specified
    let allPosts = [...carPosts, ...bikePosts];
    
    // Filter by status if specified
    if (query.status && query.status !== 'ALL') {
      allPosts = allPosts.filter(post => post.status === query.status);
    }

    // Sort by createdAt
    allPosts.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return query.order === 'ASC' ? dateA - dateB : dateB - dateA;
    });

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    return {
      data: paginatedPosts,
      total: allPosts.length,
      page,
      limit,
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

/**
 * Get all posts for admin with optional query parameters
 * Supports filtering by status, postType, pagination, and search
 */
export async function getAdminPosts(query: GetPostsQuery = {}): Promise<PostsResponse> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.sort) params.append('sort', query.sort);
  if (query.status && query.status !== 'ALL') params.append('status', query.status);
  if (query.postType) params.append('postType', query.postType);

  try {
    const response = await api.get<Post[]>(`/posts/admin/all?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const allPosts = Array.isArray(response.data) ? response.data : [];

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const paginatedPosts = allPosts.slice(offset, offset + limit);

    return {
      data: paginatedPosts,
      total: allPosts.length, // Đây là tổng số bài đăng với status tương ứng
      page,
      limit,
    };
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    throw error;
  }
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
 * Get detailed information of a post by ID
 * This endpoint provides comprehensive post details including seller info,
 * vehicle details, and images
 * Public endpoint - no authentication required
 */
export async function getPostDetail(id: string): Promise<Post> {
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

/**
 * Upload images to a post
 * Requires authentication token in headers
 * @param postId - ID of the post to upload images to
 * @param files - Array of File objects to upload (max 10 files)
 */
export async function uploadPostImages(postId: string, files: File[]): Promise<FlexibleField> {
  console.log('Uploading images for post:', postId, 'Files count:', files.length);

  // Validate files
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  // Check file types and sizes (reduce max size to avoid 413 error)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 2 * 1024 * 1024; // 2MB per file to avoid payload too large

  files.forEach((file, index) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File ${index + 1} (${file.name}) is not a supported image type`);
    }
    if (file.size > maxSize) {
      throw new Error(`File ${index + 1} (${file.name}) is too large (max 2MB)`);
    }
  });

  const formData = new FormData();

  // Add each file to the FormData
  files.forEach((file, index) => {
    console.log(`Adding file ${index}:`, file.name, file.type, file.size);
    formData.append('files', file, file.name); // Use 'files' as per Swagger doc
  });

  // Debug FormData contents
  console.log('FormData entries:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    // Try with native fetch first (sometimes works better with FormData)
    const authHeaders = getAuthHeaders();
    const response = await fetch(`${DEFAULT_API_BASE_URL}/posts/${postId}/images`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        // Don't set Content-Type - let browser set it automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fetch upload failed:', response.status, response.statusText, errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Upload successful with fetch:', data);
    return data;
  } catch (error: any) {
    console.error('Upload error details:', error);

    // Fallback to axios if fetch fails
    try {
      console.log('Trying axios fallback...');
      const { data } = await api.post(`/posts/${postId}/images`, formData, {
        headers: getAuthHeaders(),
      });
      console.log('Upload successful with axios:', data);
      return data;
    } catch (axiosError: any) {
      console.error('Axios fallback also failed:', axiosError);

      // Try different field names if both methods fail
      console.log('Trying different field names...');
      const altFormData = new FormData();
      files.forEach((file, index) => {
        altFormData.append('file', file, file.name); // Try 'file' instead of 'files'
      });

      try {
        const { data } = await api.post(`/posts/${postId}/images`, altFormData, {
          headers: getAuthHeaders(),
        });
        console.log('Upload successful with alternative field name:', data);
        return data;
      } catch (finalError: any) {
        console.error('All upload attempts failed:', finalError);
        throw finalError;
      }
    }
  }
}

// ==================== BIKE SPECIFIC API FUNCTIONS ====================

/**
 * Create a new bike post
 * Requires authentication token in headers
 */
export async function createBikePost(payload: CreateBikePostDto): Promise<Post> {
  const { data } = await api.post<Post>('/posts/bike', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get bike posts with query parameters
 * Supports filtering, pagination, and search specifically for bikes
 */
export async function getBikePostsWithQuery(query: GetPostsQuery = {}): Promise<Post[]> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<Post[]>(`/posts/bike?${params.toString()}`);
  return data;
}

/**
 * Get a single bike post by ID

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
export async function createCarPost(payload: CreateCarPostDto): Promise<Post> {
  const { data } = await api.post<Post>('/posts/car', payload, {
    headers: getAuthHeaders(),
  });
  return data;
}

/**
 * Get car posts with query parameters
 * Supports filtering, pagination, and search specifically for cars
 */
export async function getCarPostsWithQuery(query: GetPostsQuery = {}): Promise<Post[]> {
  const params = new URLSearchParams();

  if (query.q) params.append('q', query.q);
  if (query.offset !== undefined) params.append('offset', query.offset.toString());
  if (query.limit !== undefined) params.append('limit', query.limit.toString());
  if (query.order) params.append('order', query.order);
  if (query.sort) params.append('sort', query.sort);
  if (query.page !== undefined) params.append('page', query.page.toString());
  if (query.status) params.append('status', query.status);

  const { data } = await api.get<Post[]>(`/posts/car?${params.toString()}`);
  return data;
}

/**
 * Get a single car post by ID
 */

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
