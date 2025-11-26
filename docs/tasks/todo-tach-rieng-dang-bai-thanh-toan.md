# Todo: Separate Post Creation and Payment Workflow

## Overview
Change the current workflow to create a draft post immediately after filling the form, then redirect to a payment page for coin payment. After successful payment, update status to "pending review", then allow image upload. If payment is not completed (due to cancellation or issues), the post remains in draft status and requires payment to proceed to "pending review".

## New Workflow Steps
1. User fills post form → Clicks "Create Post" → Creates draft post with status "DRAFT".
2. Redirect to payment page (deduct coins).
3. On successful payment → Update post status to "PENDING_REVIEW".
4. Allow image upload after status update.
5. If payment fails or is cancelled → Post stays in "DRAFT", user can retry payment to publish.

## Requirements
- Draft posts should be visible only to the creator (in their profile/dashboard).
- Add payment page/route for post creation fee.
- Ensure wallet transaction records the postId correctly.
- Handle edge cases: payment failure, user cancellation, multiple payment attempts.

## Backend Changes
### Entities
- Update `Post` entity to include `status` field if not present (enum: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, PUBLISHED).
- Add migration for `status` field.

### Services
- `PostsService`:
  - Add `createDraftPost(dto, userId)`: Create post with status "DRAFT".
  - Add `updatePostStatus(postId, status)`: Update post status.
  - Modify `deductPostCreationFee(userId, priceVnd, postId)`: Ensure postId is required and valid.

### Controllers
- `PostsController`:
  - Add `POST /posts/draft`: Create draft post.
  - Add `PATCH /posts/:id/status`: Update post status (restricted to owner/admin).
  - Update `deductPostCreationFee` to require postId.

### DTOs
- `CreatePostDto`: Ensure it supports draft creation.
- `UpdatePostStatusDto`: New DTO for status updates.

## Frontend Changes
### Pages/Routes
- Add payment page: `/posts/create/payment/:postId` or similar.
- Update create post page to redirect to payment after draft creation.

### Hooks/Components
- `useCreatePost.ts`:
  - Modify `handleSubmit`: Create draft post first, then redirect to payment.
  - Add logic to handle payment success/failure.
- `DepositModal` or new `PaymentPage`: Handle coin deduction with postId.

### API Calls
- Add `createDraftPost(payload)` in `postApi.ts`.
- Add `updatePostStatus(postId, status)` in `postApi.ts`.
- Update `deductPostCreationFee` to include postId.

## Database Changes
- Add `status` column to `posts` table (enum type).
- Ensure foreign keys and constraints are maintained.

## Testing
- Test draft creation.
- Test payment flow and status update.
- Test image upload after payment.
- Test edge cases: payment cancellation, multiple attempts.

## Security
- Ensure only post owner can update status or pay for their draft.
- Validate postId in all payment-related operations.

## Implementation Steps
1. Update backend entities and migrations.
2. Implement backend services and controllers.
3. Update frontend API calls.
4. Modify frontend components and hooks.
5. Add payment page.
6. Test thoroughly.

## Progress Tracking Checklist
- [ ] Update Post entity to include `status` field (enum: DRAFT, PENDING_REVIEW, APPROVED, REJECTED, PUBLISHED)
- [ ] Add database migration for `status` column in `posts` table
- [ ] Add `createDraftPost(dto, userId)` method in PostsService
- [ ] Add `updatePostStatus(postId, status)` method in PostsService
- [ ] Modify `deductPostCreationFee` to require and validate `postId`
- [ ] Add `POST /posts/draft` endpoint in PostsController
- [ ] Add `PATCH /posts/:id/status` endpoint in PostsController
- [ ] Update `deductPostCreationFee` endpoint to require `postId`
- [ ] Create/Update `UpdatePostStatusDto` for status updates
- [ ] Add `createDraftPost(payload)` function in `postApi.ts`
- [ ] Add `updatePostStatus(postId, status)` function in `postApi.ts`
- [ ] Update `deductPostCreationFee` API call to include `postId`
- [ ] Modify `useCreatePost.ts` hook: `handleSubmit` to create draft and redirect to payment
- [ ] Add logic in `useCreatePost.ts` for payment success/failure handling
- [ ] Create new payment page component (`/posts/create/payment/:postId`)
- [ ] Update create post page to redirect to payment after draft creation
- [ ] Implement payment page UI and coin deduction logic
- [ ] Add route for payment page in frontend routing
- [ ] Test draft post creation
- [ ] Test payment flow and status update to PENDING_REVIEW
- [ ] Test image upload after payment completion
- [ ] Test edge cases: payment cancellation, multiple attempts, user logout
- [ ] Ensure draft posts are visible only to creator in profile/dashboard
- [ ] Add security validations: only owner can pay/update draft posts
- [ ] Validate postId in all payment-related operations
- [ ] Final integration test of complete workflow
