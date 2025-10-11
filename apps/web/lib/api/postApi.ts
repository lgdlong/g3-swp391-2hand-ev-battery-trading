import { api } from '@/lib/axios';
import { getAuthHeaders } from '@/lib/auth';
import { DEFAULT_API_BASE_URL } from '@/config/constants';
import type {
  Post,
  PostsResponse,
  CreatePostDto,
  CreateCarPostDto,
  CreateBikePostDto,
  UpdatePostDto,
  GetPostsQuery,
  FlexibleField,
} from '@/types/api/post';

// Re-export types for backward compatibility
export type {
  Post,
  PostsResponse,
  CreatePostDto,
  CreateCarPostDto,
  CreateBikePostDto,
  UpdatePostDto,
  GetPostsQuery,
};

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
    // ✅ Backend bây giờ return PaginatedBasePostResponseDto trực tiếp
    const { data } = await api.get<PostsResponse>(`/posts/admin/all?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    return data;
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
 * Search posts by title
 * Supports filtering by province and post type
 * Public endpoint - no authentication required
 */
export async function searchPosts(
  searchQuery: string,
  options: {
    provinceNameCached?: string;
    postType?: 'EV_CAR' | 'EV_BIKE' | 'BATTERY';
    limit?: number;
    offset?: number;
    order?: 'ASC' | 'DESC';
  } = {},
): Promise<Post[]> {
  const params = new URLSearchParams();

  params.append('q', searchQuery);
  if (options.provinceNameCached) params.append('provinceNameCached', options.provinceNameCached);
  if (options.postType) params.append('postType', options.postType);
  if (options.limit !== undefined) params.append('limit', options.limit.toString());
  if (options.offset !== undefined) params.append('offset', options.offset.toString());
  if (options.order) params.append('order', options.order);

  const { data } = await api.get<Post[]>(`/posts/search?${params.toString()}`);
  return data;
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
  for (const [key, value] of formData.entries()) {
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
  } catch (error: unknown) {
    console.error('Upload error details:', error);

    // Fallback to axios if fetch fails
    try {
      console.log('Trying axios fallback...');
      const { data } = await api.post(`/posts/${postId}/images`, formData, {
        headers: getAuthHeaders(),
      });
      console.log('Upload successful with axios:', data);
      return data;
    } catch (axiosError: unknown) {
      console.error('Axios fallback also failed:', axiosError);

      // Try different field names if both methods fail
      console.log('Trying different field names...');
      const altFormData = new FormData();
      files.forEach((file) => {
        altFormData.append('file', file, file.name); // Try 'file' instead of 'files'
      });

      try {
        const { data } = await api.post(`/posts/${postId}/images`, altFormData, {
          headers: getAuthHeaders(),
        });
        console.log('Upload successful with alternative field name:', data);
        return data;
      } catch (finalError: unknown) {
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
