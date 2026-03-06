# Mithila Sutra - E-commerce Platform PRD

## Original Problem Statement
Build a premium Nepal-based e-commerce brand called "Mithila Sutra" for traditional Nepali sweets, groceries, pickles, clothing, and handicrafts.

## Current Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React.js with Tailwind CSS and Shadcn/UI
- **Database:** MongoDB
- **Authentication:** Phone + OTP based JWT auth

## What's Been Implemented

### Core E-commerce Features
- ✅ Phone-based OTP authentication
- ✅ Product management (full CRUD)
- ✅ Category management (full CRUD)
- ✅ Carousel/Banner management (full CRUD)
- ✅ Shopping cart (persistent)
- ✅ Checkout flow with shipping details
- ✅ Order management and tracking
- ✅ Customer and Admin user management
- ✅ Image upload functionality
- ✅ Search functionality

### Admin Dashboard
- Dashboard Overview with stats
- Products tab - Add, Edit, Delete with image upload & ordering
- Categories tab - Add, Edit, Delete with image upload
- Carousel tab - Add, Edit, Delete with image upload
- Orders tab - View and update order status
- Customers tab - View customer list
- Admins tab - View admin list

### Payment Methods (Structure Ready)
- ✅ Cash on Delivery (COD) - **Fully Working**
- 🔄 Credit/Debit Card - Integration structure ready
- 🔄 Khalti - Integration structure ready
- 🔄 eSewa - Integration structure ready
- 🔄 IME Pay - Integration structure ready

> Note: Online payment gateways require API credentials to be added

### Carousel/Banner Features
- Full-width background image
- Overlay text (Tag, Title, Description)
- Configurable button text and link
- Order/priority control
- Responsive design

### UI/UX
- Clean, professional design
- Responsive layout (mobile-friendly)
- Large search bar in navbar
- No category navigation bar (removed per user request)
- Full-width carousel background

## Database Status
- All data cleaned per user request
- Admin user available: Phone `9800000000`
- Ready for manual content upload

## API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/products/{slug}` - Get single product
- `GET /api/categories` - List categories
- `GET /api/carousels` - List active carousel slides

### Auth
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP and get token
- `GET /api/auth/me` - Get current user

### Protected (Auth required)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `POST /api/upload-image` - Upload image

### Admin (Admin auth required)
- `POST/PUT/DELETE /api/products/{id}`
- `POST/PUT/DELETE /api/categories/{id}`
- `POST/PUT/DELETE /api/carousels/{id}`
- `GET /api/admin/stats`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`
- `GET /api/admin/customers`
- `GET /api/admin/admins`

## Key Files
- `/app/backend/server.py` - Main backend API
- `/app/frontend/src/pages/AdminDashboard.js` - Admin panel
- `/app/frontend/src/pages/CheckoutPage.js` - Checkout with payment options
- `/app/frontend/src/components/HeroCarousel.js` - Homepage carousel
- `/app/frontend/src/components/Navbar.js` - Navigation bar

## Fixed Issues
- ✅ Delete functionality for Products, Categories, Carousel (using AlertDialog)
- ✅ Image upload URL generation after fork
- ✅ Category navigation bar removed
- ✅ Search bar enlarged
- ✅ Full-width carousel background

## Pending Features (Future)
- [ ] Online payment integration (Khalti, eSewa, IME Pay, Card)
- [ ] Google social login
- [ ] Mobile app (React Native)
- [ ] AI recommendations
- [ ] Order tracking with SMS notifications
- [ ] Coupon/Discount system
- [ ] Stock management alerts

## Changelog

### 2026-03-06
- Completely rewrote AdminDashboard.js with proper AlertDialog for delete confirmation
- Fixed all delete functionality (Products, Categories, Carousel)
- Added comprehensive checkout page with 5 payment method options
- Payment structure ready for integration (COD working, others ready for credentials)
- Cleaned database for fresh start

### 2026-02-21
- Added Carousel management to backend and admin dashboard
- Full-width carousel background with text overlay
- Removed category navigation bar
- Enlarged search bar
- Fixed image upload URL generation

### Previous
- Initial implementation with FastAPI/MongoDB
- Admin dashboard with Products, Categories, Orders tabs
- Image upload support
- Phone/OTP authentication
