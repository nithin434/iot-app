# IoT Marketplace App - Production Deployment Guide

## Overview

This is a production-ready PWA (Progressive Web App) and React Native app for the IoT Marketplace platform. It includes full API integration with the FastAPI backend.

## Environment Configuration

### Development
```bash
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

### Production
```bash
NODE_ENV=production
REACT_APP_API_BASE_URL=https://api.iotmarketplace.com/api
```

## API Endpoints Connected

### Products
- `GET /products` - List products with pagination and filters
- `GET /products/:id` - Get product details
- `GET /products/search` - Search products
- `GET /categories` - List all categories
- `GET /products/recommendations/:id` - Get product recommendations

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `POST /auth/logout` - Logout user

### Cart & Orders
- `POST /orders` - Create order from cart
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order details
- `POST /orders/:id/cancel` - Cancel order
- `PUT /orders/:id/status` - Update order status (admin)

### Coupons
- `POST /coupons/validate` - Validate coupon code
- `GET /coupons/active` - Get active coupons
- `GET /coupons/:code` - Get coupon details

## Screens & Features

### Home Screen
- Dynamic banners from database categories
- Featured products carousel
- Product quick view with add to cart

### Catalog Screen
- Product grid with 2-column layout
- Category filters
- Difficulty level filters
- Sort by: popularity, price, newest
- Student pricing display
- Add to cart direct from catalog

### Cart Screen
- View cart items with quantity controls
- Apply coupon codes with validation
- Order summary with tax calculation
- Discount tracking
- Proceed to checkout

### Profile Screen
- User information display
- Order statistics
- Order history
- Saved addresses
- Settings and preferences
- Notifications toggle
- Logout functionality

### Authentication
- Email/Password login
- User registration with validation
- Student verification status
- Token-based authentication

## Key Features Implemented

1. **No Emojis** - Clean, professional UI without emoji characters
2. **Production Ready** - Error handling, loading states, retry mechanisms
3. **API Integrated** - All screens fetch real data from backend
4. **Responsive Design** - Works on mobile, tablet, and web
5. **Dark Mode Support** - Full theme switching support
6. **Offline Support** - Service workers for PWA functionality
7. **Type Safety** - Full TypeScript implementation

## Installation

```bash
cd iot-marketplace-app

# Install dependencies
npm install

# Development
npm start

# Production build
npm run build

# Expo web
npm run web
```

## Configuration Files

### API Client (`src/config/env.ts`)
Handles different API URLs for development, staging, and production environments.

### Environment Variables
Create `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_ENV=development
```

## Screens Updated for Production

1. **HomeScreen** - Fetches categories and products from API
2. **CatalogScreen** - Full filter and sort with API integration
3. **CartScreen** - Coupon validation and order creation
4. **ProfileScreen** - User data and order statistics from API
5. **Authentication Screens** - Token handling and refresh

## Data Fetching Pattern

All screens use the same pattern:

```typescript
useFocusEffect(
  useCallback(() => {
    loadData();
  }, [])
);

const loadData = async () => {
  try {
    setIsLoading(true);
    const data = await apiService.fetchData();
    setData(data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## Error Handling

- All API calls have try-catch blocks
- Loading states during API calls
- User-friendly error messages
- Retry mechanisms for failed requests
- Network error detection

## Performance Optimizations

1. **Pagination** - Products load 20 items per page
2. **Image Optimization** - Default sources for missing images
3. **Lazy Loading** - Images load on demand
4. **Caching** - Token stored in AsyncStorage
5. **Efficient Re-renders** - useFocusEffect for screen focus

## Security

1. **Token Storage** - Secure AsyncStorage for tokens
2. **Token Refresh** - Automatic refresh on 401 errors
3. **Authorization Headers** - All requests include Bearer token
4. **Interceptors** - Request/response interceptors for auth
5. **Logout** - Token cleanup on logout

## PWA Features

- Installable on home screen
- Offline capability with service workers
- App-like experience
- Fast loading with caching
- Push notifications ready

## Deployment

### Web (PWA)
```bash
npm run build
# Deploy to Vercel/Netlify
vercel deploy --prod
```

### Mobile (Android/iOS)
```bash
eas build --platform all
eas submit --platform all
```

## Backend API Requirements

The app expects the following backend endpoints:

### Products
```
GET /api/products?page=1&limit=20&categoryId=xyz&sortBy=popularity
GET /api/categories
GET /api/products/:id
```

### Orders
```
POST /api/orders
GET /api/orders
GET /api/orders/:id
```

### Coupons
```
POST /api/coupons/validate
```

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
```

## Monitoring

- API response times tracked
- Error logging implemented
- User actions monitored for analytics
- Performance metrics collected

## Troubleshooting

### API Connection Issues
1. Check `src/config/env.ts` for correct API URL
2. Verify backend server is running
3. Check network connectivity
4. Review browser console for errors

### Styling Issues
1. Check `src/theme/colors.ts` for theme colors
2. Verify responsive utilities in `src/utils/responsive.ts`
3. Test on different screen sizes

### Authentication Issues
1. Verify tokens in AsyncStorage
2. Check token refresh mechanism
3. Ensure correct credentials being sent
4. Clear AsyncStorage and re-login if stuck

## Future Enhancements

- Search functionality with filters
- Wishlist/Saved items
- Product reviews and ratings
- Real-time order tracking
- Live chat support
- Advanced analytics
- A/B testing framework
- Payment gateway integration

## Support

For issues or questions:
- Check API documentation: `http://localhost:8000/docs`
- Review admin panel: `http://localhost:8000/admin/`
- Check backend logs for API errors
- Review app logs in browser console

---

**Last Updated:** February 5, 2026
**Version:** 1.0.0
**Status:** Production Ready
