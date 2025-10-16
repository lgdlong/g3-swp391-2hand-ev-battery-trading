# Update Post Feature

This folder contains the implementation of the update post functionality for the 2nd-hand EV Battery Trading Platform.

## Features

- **Post Type Detection**: Automatically detects whether the post is for EV_CAR, EV_BIKE, or BATTERY
- **Form Reuse**: Leverages existing form components from the create post page
- **Type-Specific Updates**: Handles different data structures for car details, bike details, and battery details
- **Data Population**: Pre-fills form fields with existing post data
- **Validation**: Client-side validation for required fields
- **API Integration**: Uses TanStack Query for efficient data fetching and caching

## File Structure

```
my-posts/[id]/
├── page.tsx                 # Main update post page
├── _components/
│   ├── UpdatePostForm.tsx   # Main form component
│   └── utils.ts            # Utility functions for data conversion
└── README.md               # This file
```

## Key Components

### UpdatePostForm.tsx
The main form component that:
- Fetches existing post data
- Initializes form state with current values
- Handles type-specific form rendering
- Manages form submission with proper data transformation
- Provides user feedback through toast notifications

### utils.ts
Utility functions for:
- Converting FlexibleField types to string values
- Handling complex API response structures

## API Integration

The update functionality uses:
- `updateMyPost(postId, updateData)` - Updates the post via PATCH request
- `getCarBrands()`, `getBikeBrands()` - Fetches brand catalogs for EV forms
- `getCarModels()`, `getBikeModels()` - Fetches model catalogs based on selected brand

## Type Safety

The implementation maintains strict TypeScript typing:
- Uses proper interfaces for Post, CarDetail, BikeDetail, BatteryDetail
- Handles FlexibleField type conversions safely
- Maintains compatibility with existing form components

## User Experience

- Pre-populated forms with existing data
- Real-time validation feedback
- Loading states during API calls
- Success/error notifications
- Automatic redirect to my-posts after successful update

## Technical Notes

- Leverages React Hook Form patterns from existing create forms
- Uses TanStack Query for efficient caching and state management
- Handles complex type unions for different post types
- Maintains backward compatibility with existing API structure
