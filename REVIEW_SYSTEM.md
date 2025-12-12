# Product Review & Rating System

## Overview
This system allows customers to add reviews and ratings (out of 5 stars) when they add products to their cart. The reviews are integrated seamlessly with the cart functionality and provide valuable feedback for other customers.

## Features

### 🎯 **Core Functionality**
- **Review Creation**: Customers can write reviews with ratings (1-5 stars), titles, and comments
- **Cart Integration**: Review prompts appear when adding products to cart
- **Real-time Updates**: Product ratings and review counts update automatically
- **User Experience**: Optional review submission - customers can skip if they prefer

### ⭐ **Rating System**
- **5-Star Rating**: Visual star selection with hover effects
- **Average Calculation**: Automatic calculation of product average ratings
- **Review Count**: Tracks total number of reviews per product

### 📝 **Review Management**
- **One Review Per User**: Users can only review each product once
- **Edit Reviews**: Users can update their existing reviews
- **Helpful Voting**: Other users can mark reviews as helpful/unhelpful
- **Verified Badges**: Support for verified purchase badges

## Technical Implementation

### Backend Components

#### 1. **Review Model** (`backend/src/models/Review.js`)
```javascript
{
  user: ObjectId,        // Reference to User
  product: ObjectId,     // Reference to Product
  rating: Number,        // 1-5 stars
  title: String,         // Review title (max 100 chars)
  comment: String,       // Review comment (max 500 chars)
  helpful: Array,        // Helpful votes from users
  verified: Boolean,     // Verified purchase status
  timestamps: true
}
```

#### 2. **Review Controller** (`backend/src/controllers/reviewController.js`)
- `createReview`: Create or update product reviews
- `getProductReviews`: Get paginated reviews for a product
- `getUserReviews`: Get all reviews by a specific user
- `updateReviewHelpful`: Handle helpful/unhelpful voting
- `deleteReview`: Remove reviews (user or admin only)

#### 3. **Cart Integration** (`backend/src/controllers/cartController.js`)
- Modified `addItemToCart` to accept optional review data
- Automatically creates/updates reviews when adding to cart
- Updates product ratings and review counts

#### 4. **API Routes** (`backend/src/routes/reviewRoutes.js`)
- `POST /api/reviews` - Create/update review
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/user` - Get user's reviews
- `PUT /api/reviews/:id/helpful` - Vote on review helpfulness
- `DELETE /api/reviews/:id` - Delete review

### Frontend Components

#### 1. **ReviewForm** (`frontend/src/components/review/ReviewForm.jsx`)
- Interactive 5-star rating selection
- Title and comment input fields
- Form validation and character limits
- Responsive design with hover effects

#### 2. **ReviewModal** (`frontend/src/components/review/ReviewModal.jsx`)
- Modal dialog for review submission
- Integrated with cart addition flow
- Skip option for customers who don't want to review

#### 3. **ReviewList** (`frontend/src/components/review/ReviewList.jsx`)
- Display all reviews for a product
- Pagination support
- Helpful voting functionality
- User profile images and verification badges

#### 4. **Product Integration**
- **ProductDetailPage**: Shows ratings and review modal
- **ProductCard**: Displays star ratings and review counts
- **Cart System**: Handles review data during cart operations

## User Flow

### 1. **Adding Product to Cart**
```
Customer clicks "Add to Cart" → Review Modal appears → 
Customer can: Write Review OR Skip → Product added to cart with/without review
```

### 2. **Review Submission**
```
Customer fills review form → Submits → Review saved → 
Product rating updated → Cart item added → Success message
```

### 3. **Review Display**
```
Reviews shown on product page → Pagination → Helpful voting → 
Real-time updates → User engagement

## Database Schema Updates

### Product Model
- `rating`: Average rating (0-5, rounded to 1 decimal)
- `numReviews`: Total number of reviews

### Review Model
- Unique index on `{user, product}` ensures one review per user per product
- Virtual field for helpful count calculation
- Timestamps for review age tracking

## API Endpoints

### Public Endpoints
- `GET /api/reviews/product/:productId` - View product reviews

### Protected Endpoints (Authentication Required)
- `POST /api/reviews` - Create/update review
- `GET /api/reviews/user` - Get user's reviews
- `PUT /api/reviews/:id/helpful` - Vote on review
- `DELETE /api/reviews/:id` - Delete review

## Security Features

- **Authentication Required**: All review operations require user login
- **Ownership Validation**: Users can only edit/delete their own reviews
- **Admin Privileges**: Admins can delete any review
- **Input Validation**: Title/comment length limits and rating range validation
- **SQL Injection Protection**: Mongoose schema validation

## Performance Considerations

- **Indexing**: Unique index on user-product combination
- **Pagination**: Reviews loaded in batches (default: 5 per page)
- **Population**: Efficient user data loading with select fields
- **Caching**: Product ratings cached in Product model

## Future Enhancements

- **Review Moderation**: Admin approval system for reviews
- **Photo Reviews**: Support for image attachments
- **Review Analytics**: Detailed review insights and trends
- **Email Notifications**: Review submission confirmations
- **Review Incentives**: Rewards for helpful reviews
- **Multi-language Support**: International review localization

## Installation & Setup

### Backend Dependencies
```bash
# Review model and routes are automatically included
# No additional packages required
```

### Frontend Dependencies
```bash
# Ensure Heroicons are available for star ratings
npm install @heroicons/react
```

### Database Migration
```bash
# Review collection will be created automatically
# Existing products will have rating: 0, numReviews: 0
```

## Testing

### Backend Tests
- Review creation and updates
- Rating calculations
- User authorization
- Input validation

### Frontend Tests
- Review form submission
- Modal interactions
- Rating display
- Cart integration

## Troubleshooting

### Common Issues
1. **Review not saving**: Check user authentication
2. **Rating not updating**: Verify product ID in review
3. **Modal not showing**: Check cart integration
4. **Stars not displaying**: Verify Heroicons installation

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Confirm database connections
4. Validate user authentication state

## Support

For technical support or feature requests related to the review system, please refer to the main project documentation or contact the development team.
