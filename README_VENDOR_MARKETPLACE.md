# Multi-Vendor Laboratory and Pharmacy Marketplace

A comprehensive healthcare marketplace platform where independent pharmacies and laboratories can register as vendors, manage their products/services, and serve patients through a unified platform.

## Architecture Overview

### Multi-Tenancy Model
- **Vendor-based isolation**: All vendor-owned documents carry a `vendorId` field
- **Automatic scoping**: Middleware automatically filters queries by logged-in user's vendorId
- **Role-based access**: Super Admin, Vendor Owner, Vendor Staff, and Patient roles
- **Order splitting**: Single checkout creates parent order + sub-orders per vendor

### Tech Stack
- **Backend**: Node.js, Express, MongoDB with Mongoose, JWT auth (access + refresh), bcrypt
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios, React Query, React Hook Form + Zod, Recharts

## Folder Structure

### Backend
```
Backend/
├── Models/                    # Mongoose schemas
│   ├── User.model.js         # Extended with vendor roles
│   ├── Vendor.model.js       # NEW: Central vendor entity
│   ├── VendorStaff.model.js  # NEW: Staff accounts
│   ├── Product.model.js      # NEW: Pharmacy products
│   ├── LabTest.model.js      # NEW: Lab tests
│   ├── LabPackage.model.js   # NEW: Lab packages
│   ├── Order.model.js        # NEW: Parent + sub-orders
│   ├── Cart.model.js         # NEW: Shopping cart
│   ├── Commission.model.js   # NEW: Commission settings
│   ├── Payout.model.js       # NEW: Vendor payouts
│   ├── Slot.model.js         # NEW: Lab time slots
│   ├── AuditLog.model.js     # NEW: Audit trail
│   ├── Review.model.js       # NEW: Vendor reviews
│   ├── Laboratory.model.js   # EXTENDED: Added vendorId
│   ├── Pharmacy.model.js     # EXTENDED: Added vendorId
│   └── ...
├── Controllers/              # Route handlers
│   ├── Vendor.controller.js
│   ├── VendorStaff.controller.js
│   ├── Product.controller.js
│   ├── LabTest.controller.js
│   ├── PharmacyOrder.controller.js
│   ├── LabBooking.controller.js
│   ├── PatientMarketplace.controller.js
│   ├── Dashboard.controller.js
│   ├── AdminSuper.controller.js
│   └── ...
├── Services/                 # Business logic
│   ├── vendorService.js
│   ├── vendorStaffService.js
│   ├── productService.js
│   ├── labTestService.js
│   ├── pharmacyOrderService.js
│   ├── labBookingService.js
│   ├── patientMarketplaceService.js
│   ├── dashboardService.js
│   └── adminService.js
├── Middleware/               # Auth and validation
│   ├── Auth.middleware.js    # Extended with refresh tokens
│   └── Vendor.middleware.js  # NEW: Tenant scoping, RBAC
├── Routes/                   # API routes
│   ├── Vendor.routes.js
│   ├── VendorStaff.routes.js
│   ├── Product.routes.js
│   ├── LabTest.routes.js
│   ├── PharmacyOrder.routes.js
│   ├── LabBooking.routes.js
│   ├── PatientMarketplace.routes.js
│   ├── Dashboard.routes.js
│   └── ...
├── utils/                    # Utilities
│   └── auth.js               # NEW: Token generation
├── config/                   # Configuration
├── Database/                 # DB connection
├── seed.js                   # NEW: Seed script
├── .env.example              # NEW: Environment template
├── server.js                 # Express app
└── index.js                  # Entry point
```

### Frontend
```
Frontend/
├── src/
│   ├── pages/
│   │   ├── patient/          # Patient-facing pages
│   │   │   ├── Marketplace.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Orders.jsx
│   │   ├── vendor/           # Vendor dashboard
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products/
│   │   │   ├── Orders/
│   │   │   ├── LabTests/
│   │   │   ├── Bookings/
│   │   │   └── Settings.jsx
│   │   └── admin/            # Super admin dashboard
│   │       ├── Overview.jsx
│   │       ├── Vendors.jsx
│   │       ├── Commissions.jsx
│   │       ├── Payouts.jsx
│   │       └── Users.jsx
│   ├── components/
│   │   ├── vendor/           # Vendor-specific components
│   │   └── marketplace/      # Marketplace components
│   ├── lib/
│   │   └── authContext.jsx    # Auth context
│   └── ...
```

## Setup Instructions

### 1. Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 2. Seed Database

```bash
node seed.js
```

This creates:
- 1 Super Admin
- 2 Pharmacy Vendors (approved)
- 2 Laboratory Vendors (approved)
- Sample products, lab tests, lab packages
- 2 Sample patients

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

## API Reference

### Authentication

#### POST /api/auth/register
Register new user (patient)

#### POST /api/auth/login
Login user

#### POST /api/auth/refresh
Refresh access token using refresh token

#### POST /api/auth/logout
Logout (clears refresh token cookie)

### Vendor Management

#### POST /api/vendors/register
Register new vendor (pharmacy or laboratory)

#### POST /api/vendors/login
Vendor login

#### GET /api/vendors/profile
Get current vendor profile (vendor owner)

#### PUT /api/vendors/profile
Update vendor profile

#### GET /api/vendors/public/search
Search approved vendors (public)

#### GET /api/vendors/public/:vendorId
Get public vendor profile

#### GET /api/vendors/admin/list
List all vendors (super admin)

#### PUT /api/vendors/admin/:vendorId/approve
Approve vendor (super admin)

#### PUT /api/vendors/admin/:vendorId/reject
Reject vendor (super admin)

#### PUT /api/vendors/admin/:vendorId/suspend
Suspend vendor (super admin)

#### PUT /api/vendors/admin/:vendorId/reactivate
Reactivate vendor (super admin)

### Vendor Staff Management

#### POST /api/vendor-staff/login
Staff login

#### GET /api/vendor-staff/
List staff (vendor owner/staff)

#### GET /api/vendor-staff/:staffId
Get staff details

#### POST /api/vendor-staff/invite
Invite staff member (vendor owner)

#### PUT /api/vendor-staff/:staffId/permissions
Update staff permissions (vendor owner)

#### PUT /api/vendor-staff/:staffId/status
Update staff status (vendor owner)

#### DELETE /api/vendor-staff/:staffId
Remove staff (vendor owner)

### Product Management (Pharmacy)

#### POST /api/products
Create product

#### GET /api/products
List products with filters

#### GET /api/products/categories
Get product categories

#### GET /api/products/alerts/low-stock
Get low stock alerts

#### GET /api/products/alerts/near-expiry
Get near expiry products

#### GET /api/products/alerts/out-of-stock
Get out of stock products

#### GET /api/products/summary
Get inventory summary

#### GET /api/products/:productId
Get product details

#### PUT /api/products/:productId
Update product

#### DELETE /api/products/:productId
Delete product (soft delete)

#### PATCH /api/products/:productId/stock
Update stock (atomic)

### Lab Test/Package Management (Laboratory)

#### POST /api/lab-tests/tests
Create lab test

#### GET /api/lab-tests/tests
List lab tests

#### GET /api/lab-tests/tests/categories
Get test categories

#### GET /api/lab-tests/tests/:testId
Get test details

#### PUT /api/lab-tests/tests/:testId
Update test

#### DELETE /api/lab-tests/tests/:testId
Delete test

#### POST /api/lab-tests/packages
Create lab package

#### GET /api/lab-tests/packages
List lab packages

#### GET /api/lab-tests/packages/:packageId
Get package details

#### PUT /api/lab-tests/packages/:packageId
Update package

#### DELETE /api/lab-tests/packages/:packageId
Delete package

### Order Management (Pharmacy)

#### GET /api/pharmacy-orders
List pharmacy orders

#### GET /api/pharmacy-orders/statistics
Get order statistics

#### GET /api/pharmacy-orders/:orderId
Get order details

#### PUT /api/pharmacy-orders/:orderId/sub-orders/:subOrderId/status
Update order status

#### PUT /api/pharmacy-orders/:orderId/sub-orders/:subOrderId/prescription
Verify/reject prescription

### Booking Management (Laboratory)

#### GET /api/lab-bookings
List lab bookings

#### GET /api/lab-bookings/statistics
Get booking statistics

#### GET /api/lab-bookings/:orderId
Get booking details

#### PUT /api/lab-bookings/:orderId/sub-orders/:subOrderId/status
Update booking status

#### PUT /api/lab-bookings/:orderId/sub-orders/:subOrderId/report
Upload report

### Patient Marketplace

#### GET /api/marketplace/products
Browse products across vendors

#### GET /api/marketplace/products/:productId
Get product details

#### GET /api/marketplace/lab-tests
Browse lab tests across vendors

#### GET /api/marketplace/lab-packages
Browse lab packages across vendors

#### GET /api/marketplace/cart
Get user cart

#### POST /api/marketplace/cart
Add item to cart

#### PUT /api/marketplace/cart/:itemId
Update cart item

#### DELETE /api/marketplace/cart/:itemId
Remove from cart

#### DELETE /api/marketplace/cart
Clear cart

#### POST /api/marketplace/checkout
Checkout (creates order with sub-orders per vendor)

#### GET /api/marketplace/orders
Get user orders

#### GET /api/marketplace/orders/:orderId
Get order details

### Dashboard

#### GET /api/dashboard/overview
Get vendor dashboard overview

#### GET /api/dashboard/sales-chart
Get sales chart data

#### GET /api/dashboard/recent-orders
Get recent orders

#### GET /api/dashboard/recent-reviews
Get recent reviews

### Super Admin

#### GET /api/admin/super/overview
Get platform overview

#### GET /api/admin/super/sales-chart
Get platform sales chart

#### GET /api/admin/super/vendor-performance
Get vendor performance

#### GET /api/admin/super/users
List all users

#### GET /api/admin/super/commissions
Get commission settings

#### POST /api/admin/super/commissions
Create commission setting

#### PUT /api/admin/super/commissions/:commissionId
Update commission setting

#### DELETE /api/admin/super/commissions/:commissionId
Delete commission setting

#### GET /api/admin/super/payouts/calculate
Calculate vendor payouts

#### POST /api/admin/super/payouts
Create payout

#### GET /api/admin/super/payouts
List payouts

#### PUT /api/admin/super/payouts/:payoutId/status
Update payout status

#### PUT /api/admin/super/products/:productId/flag
Flag product (deactivate)

#### PUT /api/admin/super/lab-tests/:testId/flag
Flag lab test (deactivate)

#### PUT /api/admin/super/lab-packages/:packageId/flag
Flag lab package (deactivate)

## Key Features

### Multi-Tenancy
- Every vendor-owned document has `vendorId`
- Compound indexes on `vendorId` for performance
- Middleware automatically scopes queries by vendorId
- Vendors cannot access other vendors' data

### Order Splitting
- Cart items grouped by vendor
- One checkout creates:
  - Parent order (for patient)
  - Sub-order per vendor (for vendor management)
- Each sub-order has independent status tracking
- Commission calculated per sub-order at placement time

### Atomic Stock Management
- Stock decremented atomically during checkout
- Prevents overselling with conditional updates
- Error thrown if insufficient stock

### Audit Logging
- All sensitive actions logged:
  - Vendor approval/rejection/suspension
  - Prescription verification
  - Report upload
  - Payout processing
  - Staff permission changes
  - Product/test CRUD

### Commission System
- Platform-wide default rates (15% pharmacy, 12% lab)
- Per-vendor override possible
- Commission calculated at order placement
- Stored on sub-order for payout calculation

### Payout System
- Calculate vendor earnings for any period
- Mark orders as processed
- Track payout status (pending → processing → paid/failed)
- Payment details recorded

## Security Features

- JWT access tokens (15min expiry)
- Refresh tokens (7day expiry, HTTP-only cookie)
- Role-based access control (RBAC)
- Vendor data isolation (tenant scoping)
- Granular staff permissions
- Password hashing with bcrypt
- NoSQL injection sanitization
- Helmet security headers
- CORS configuration
- Rate limiting

## Schema Changes Summary

### Extended Models
- **User**: Added roles (super_admin, vendor_owner, vendor_staff), added vendorId field
- **Laboratory**: Added vendorId field
- **Pharmacy**: Added vendorId field
- **LabBooking**: Added vendorId field
- **MedicalReport**: Added vendorId field

### New Models
- **Vendor**: Central multi-tenant entity
- **VendorStaff**: Staff accounts with permissions
- **Product**: Pharmacy products with inventory
- **LabTest**: Laboratory tests
- **LabPackage**: Bundled test packages
- **Order**: Parent order + sub-orders
- **Cart**: Shopping cart
- **Commission**: Platform commission settings
- **Payout**: Vendor payouts
- **Slot**: Lab time slots
- **AuditLog**: Audit trail
- **Review**: Vendor reviews

## Assumptions

1. Payment gateway integration is out of scope (COD placeholder used)
2. File upload service (Cloudinary) configuration assumed from existing setup
3. Email service for notifications assumed from existing setup
4. Existing doctor/patient/laboratory/pharmacy approval workflows remain unchanged
5. Frontend implementation to be done in separate phase
6. Production deployment requires additional security hardening

## Next Steps

1. Implement frontend React components for all modules
2. Integrate payment gateway (Stripe/Razorpay)
3. Add real-time notifications (WebSocket)
4. Implement dispute resolution system
5. Add analytics and reporting dashboards
6. Add mobile app support
7. Implement SMS notifications
8. Add multi-language support
