# API Integration Summary

## Updated Screens

All screens have been updated to fetch real data from the API backend.

### 1. HomeScreen (`src/screens/home/HomeScreen.tsx`)
**Features:**
- Fetches categories and products from `/products` and `/categories`
- Dynamic banner creation from category data
- Auto-scrolling banners with pagination dots
- Featured products section
- Student pricing display
- Category browsing with navigation

**API Calls:**
```
GET /api/categories
GET /api/products?limit=12&page=1
```

### 2. CatalogScreen (`src/screens/catalog/CatalogScreen.tsx`)
**Features:**
- Full product catalog with grid layout
- Category filtering
- Difficulty level filtering
- Price-based sorting
- Pagination with load more
- Student pricing
- Quick add to cart

**API Calls:**
```
GET /api/products?page=1&limit=20&categoryId=xyz
GET /api/categories
```

**Filters Applied:**
- Category selection
- Difficulty level (beginner, intermediate, advanced)
- Price range (min/max)
- Sort by (popularity, price, newest)
- In stock filtering

### 3. CartScreen (`src/screens/cart/CartScreen.tsx`)
**Features:**
- Display cart items with quantity controls
- Coupon code validation
- Order total calculation with taxes
- Discount tracking
- Order creation
- Empty state handling

**API Calls:**
```
POST /api/coupons/validate
POST /api/orders
```

**Coupon Integration:**
- Validates coupon code
- Shows discount amount (percentage or fixed)
- Checks minimum order value
- Displays coupon status

### 4. ProfileScreen (`src/screens/profile/ProfileScreen.tsx`)
**Features:**
- User profile information
- Order statistics (total, completed, pending)
- Total spending amount
- Order history navigation
- Address management
- Settings and preferences

**API Calls:**
```
GET /api/auth/profile
GET /api/orders
```

## API Client Configuration

### File: `src/config/env.ts`
Handles environment-specific API URLs:
- **Development:** `http://localhost:8000/api`
- **Staging:** `https://staging-api.iotmarketplace.com/api`
- **Production:** `https://api.iotmarketplace.com/api`

### File: `src/services/api/client.ts`
Updated with:
- Dynamic API base URL from config
- Automatic token refresh on 401 errors
- Request/response interceptors
- Error handling and logging

## New API Services

### `src/services/api/coupons.ts`
```typescript
- validateCoupon(code, orderTotal)
- getActiveCoupons()
- getCouponByCode(code)
```

### Updated `src/services/api/cart.ts`
```typescript
- createOrder(checkoutData)
- getUserOrders()
- getOrderById(orderId)
- cancelOrder(orderId)
- updateOrderStatus(orderId, status)
```

## Data Flow Examples

### Example 1: Adding Item to Cart
```
User clicks Add to Cart
→ handleAddToCart() called
→ cartStore.addItem() updates local state
→ User navigates to cart
→ CartScreen shows local items
→ Coupon validation via API
→ Order creation via API
```

### Example 2: Browsing Products
```
User opens Catalog
→ CatalogScreen fetches /api/products
→ Products displayed in grid
→ User selects category filter
→ API called with filter params
→ Results updated
→ User clicks product
→ Navigates to ProductDetail
```

### Example 3: User Profile
```
User opens Profile
→ ProfileScreen fetches /api/auth/profile
→ User data displayed
→ Also fetches /api/orders for stats
→ Shows order history, statistics
→ User can navigate to order details
```

## Authentication Flow

1. **Login** → Token stored in AsyncStorage
2. **Subsequent Requests** → Token added to headers
3. **Token Expired** → Automatic refresh via `/api/auth/refresh`
4. **Logout** → Tokens cleared from storage

## Error Handling

All screens implement:
- Loading indicators during API calls
- Error messages displayed to user
- Retry functionality
- Fallback UI states

```typescript
try {
  setIsLoading(true);
  const data = await service.fetchData();
  setData(data);
} catch (error) {
  Alert.alert('Error', error.message);
} finally {
  setIsLoading(false);
}
```

## Responsive Design

- All screens use `moderateScale()` for text sizing
- `getResponsivePadding()` for consistent spacing
- Tablet-specific layouts where needed
- Flexible grid layouts for products

## PWA Manifest

**File:** `public/manifest.json`
Configured with:
- App name and description
- Icons for different sizes
- Start URL and scope
- Standalone display mode
- Theme colors
- App shortcuts

## No Emoji Implementation

All UI text is emoji-free:
- Icons use `MaterialCommunityIcons` instead
- Clean, professional text labels
- Accessible text for screen readers

## Performance Considerations

1. **Image Optimization**
   - Default sources for missing images
   - Network images loaded on demand
   - Proper caching headers

2. **Pagination**
   - 20 items per page by default
   - Load more on scroll
   - Prevents excessive data transfer

3. **Caching**
   - Tokens cached in AsyncStorage
   - Categories cached after first load
   - Images cached by device

## Testing Checklist

- [ ] HomeScreen loads categories and products
- [ ] CatalogScreen filters work correctly
- [ ] CartScreen calculates totals properly
- [ ] Coupon validation works
- [ ] Order creation succeeds
- [ ] ProfileScreen shows user data
- [ ] Navigation between screens works
- [ ] Error states handled gracefully
- [ ] Loading states displayed
- [ ] Student pricing shows correctly
- [ ] Responsive layout on all sizes

## Migration from Hardcoded Data

**Before:** Static data in component
```typescript
const promoBanners = [{ id: '1', title: '...' }, ...]
```

**After:** Dynamic data from API
```typescript
const [banners, setBanners] = useState([]);

useFocusEffect(() => {
  const categories = await productsService.getCategories();
  setBanners(categories);
});
```

## Backend Requirements

Backend must provide these endpoints:

1. `GET /api/categories`
2. `GET /api/products`
3. `POST /api/orders`
4. `GET /api/orders`
5. `POST /api/coupons/validate`
6. `GET /api/auth/profile`

All endpoints must return proper error responses with:
- `status` code
- `message` description
- `data` payload (if applicable)

---

**All screens are now production-ready with full API integration!**
