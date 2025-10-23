/**
 * Post Lifecycle type definitions
 */

export interface PostLifecycle {
  id: number;
  expirationDays: number;
  autoApprove: boolean;
  updatedAt: string;
}

export interface UpdatePostLifecycleDto {
  expirationDays: number;
  autoApprove: boolean;
}

export interface DeletePostLifecycleResponse {
  message: string;
}
