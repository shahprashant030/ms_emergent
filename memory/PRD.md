# Mithila Sutra - E-commerce Platform PRD

## Original Problem Statement
Build a premium Nepal-based e-commerce brand called "Mithila Sutra" for traditional Nepali sweets, groceries, pickles, clothing, and handicrafts.

## Current Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React.js with Tailwind CSS
- **Database:** MongoDB
- **Authentication:** Phone + OTP based JWT auth

> **Note:** Original request was for Django/PostgreSQL but implemented with FastAPI/MongoDB.

## What's Been Implemented

### Core Features
- ✅ Phone-based OTP authentication
- ✅ Product management (CRUD)
- ✅ Category management (CRUD)
- ✅ Carousel management (CRUD) - **NEW**
- ✅ Order management
- ✅ Customer and Admin user lists
- ✅ Image upload functionality
- ✅ Admin Dashboard with multiple tabs

### Admin Dashboard Tabs
1. **Dashboard** - Overview with stats
2. **Products** - Full CRUD with image upload
3. **Categories** - Full CRUD with image upload
4. **Carousel** - Full CRUD with image upload (NEW)
5. **Orders** - View and update status
6. **Customers** - View customer list
7. **Admins** - View admin list

### Carousel Slide Fields
- Image (single image per slide)
- Tag (e.g., "FESTIVAL SPECIAL")
- Title (e.g., "Flat 50% OFF")
- Description
- Button Text (e.g., "Shop Now", "Grab the Offer")
- Button Link
- Order (for slide ordering)

## Database Status
- All data cleaned per user request
- Admin user available: Phone `9800000000`
- Ready for manual product upload

## API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/categories` - List categories
- `GET /api/carousels` - List active carousel slides

### Admin (Auth required)
- `POST/PUT/DELETE /api/products/{id}`
- `POST/PUT/DELETE /api/categories/{id}`
- `POST/PUT/DELETE /api/carousels/{id}`
- `GET /api/admin/carousels` - All carousels (including inactive)
- `POST /api/upload-image` - Image upload

## Key Files
- `/app/backend/server.py` - Main backend API
- `/app/frontend/src/pages/AdminDashboard.js` - Admin panel
- `/app/frontend/src/components/HeroCarousel.js` - Homepage carousel
- `/app/frontend/src/components/AdminNavbar.js` - Admin navigation

## Pending Features (Future)
- [ ] Image ordering for products
- [ ] Advanced product filtering
- [ ] Payment gateway integration (eSewa, Khalti)
- [ ] Google social login
- [ ] Mobile app (React Native)
- [ ] AI recommendations

## Changelog

### 2026-02-21
- Added Carousel management to backend and admin dashboard
- Fixed product deletion functionality
- Fixed category deletion functionality
- Fixed image upload URL generation after fork
- Cleaned database for fresh start
- Homepage carousel now fetches from backend API

### Previous
- Initial implementation with FastAPI/MongoDB
- Admin dashboard with Products, Categories, Orders tabs
- Image upload support
- Phone/OTP authentication
