# Settings Module Documentation

## Overview

The Settings module provides CRUD operations for three important configuration tables:

1. **Fee Tiers** - Manage transaction fee structures
2. **Refund Policies** - Configure refund policies and rules
3. **Post Lifecycle** - Define post status management

## Database Tables

### 1. fee_tiers

```sql
CREATE TABLE fee_tiers (
    id BIGSERIAL PRIMARY KEY,
    tier_name VARCHAR(100) NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL CHECK (min_amount >= 0),
    max_amount DECIMAL(15,2) CHECK (max_amount >= 0),
    fee_percentage DECIMAL(5,4) NOT NULL CHECK (fee_percentage >= 0),
    fixed_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (fixed_fee >= 0),
    priority_order INTEGER NOT NULL CHECK (priority_order >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_fee_tiers_priority ON fee_tiers(priority_order);
CREATE INDEX idx_fee_tiers_active ON fee_tiers(is_active);
```

### 2. refund_policy

```sql
CREATE TABLE refund_policy (
    id BIGSERIAL PRIMARY KEY,
    policy_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    refund_window_days INTEGER NOT NULL CHECK (refund_window_days >= 0),
    penalty_percentage INTEGER NOT NULL DEFAULT 0 CHECK (penalty_percentage >= 0 AND penalty_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_refund_policy_active ON refund_policy(is_active);
```

### 3. post_lifecycle

```sql
CREATE TABLE post_lifecycle (
    id BIGSERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    status_type VARCHAR(20) NOT NULL CHECK (status_type IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SOLD', 'REJECTED')),
    duration_days INTEGER CHECK (duration_days >= 0),
    is_deletable BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_post_lifecycle_status_type ON post_lifecycle(status_type);
CREATE INDEX idx_post_lifecycle_display_order ON post_lifecycle(display_order);
```

## API Endpoints

### Fee Tiers
- `GET /settings/fee-tiers` - Get all fee tiers
- `GET /settings/fee-tiers/:id` - Get specific fee tier
- `POST /settings/fee-tiers` - Create new fee tier
- `PUT /settings/fee-tiers/:id` - Update fee tier
- `DELETE /settings/fee-tiers/:id` - Delete fee tier

### Refund Policies
- `GET /settings/refund-policies` - Get all refund policies
- `GET /settings/refund-policies/:id` - Get specific refund policy
- `POST /settings/refund-policies` - Create new refund policy
- `PUT /settings/refund-policies/:id` - Update refund policy
- `DELETE /settings/refund-policies/:id` - Delete refund policy

### Post Lifecycle
- `GET /settings/post-lifecycle` - Get all post lifecycle statuses
- `GET /settings/post-lifecycle/:id` - Get specific post lifecycle status
- `POST /settings/post-lifecycle` - Create new post lifecycle status
- `PUT /settings/post-lifecycle/:id` - Update post lifecycle status
- `DELETE /settings/post-lifecycle/:id` - Delete post lifecycle status

## Authorization

All endpoints require:
- **Authentication**: JWT Bearer token
- **Authorization**: ADMIN role

## Usage Examples

### Create Fee Tier

```bash
POST /settings/fee-tiers
Authorization: Bearer <token>
Content-Type: application/json

{
  "tierName": "Standard Tier",
  "minAmount": 0,
  "maxAmount": 1000000,
  "feePercentage": 0.025,
  "fixedFee": 0,
  "priorityOrder": 1,
  "isActive": true
}
```

### Create Refund Policy

```bash
POST /settings/refund-policies
Authorization: Bearer <token>
Content-Type: application/json

{
  "policyName": "7-Day Full Refund",
  "description": "Full refund available within 7 days of purchase",
  "refundWindowDays": 7,
  "penaltyPercentage": 0,
  "isActive": true
}
```

### Create Post Lifecycle Status

```bash
POST /settings/post-lifecycle
Authorization: Bearer <token>
Content-Type: application/json

{
  "statusName": "UNDER_REVIEW",
  "description": "Post is being reviewed by administrators",
  "statusType": "PENDING",
  "durationDays": 3,
  "isDeletable": true,
  "displayOrder": 1
}
```

## Features

### Fee Tiers
- Range validation (prevents overlapping tier amounts)
- Priority ordering for tier evaluation
- Active/inactive status management
- Soft delete functionality

### Refund Policies
- Flexible refund window configuration
- Penalty percentage support
- Active/inactive status management
- Soft delete functionality

### Post Lifecycle
- Unique status names
- Status type categorization
- Optional duration settings
- Deletable/non-deletable status protection
- Display order for UI

## Error Handling

The module includes comprehensive error handling:
- Input validation using class-validator
- Business logic validation (e.g., overlapping ranges)
- Not found exceptions
- Forbidden operations (e.g., deleting non-deletable status)

## Next Steps

1. Run database migrations to create the tables
2. Add initial seed data for default configurations
3. Integrate with post management system for lifecycle usage
4. Implement fee calculation logic using fee tiers
5. Set up refund processing using refund policies
