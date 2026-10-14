# Phase 1 Complete: Schemas, Auth, RBAC, Tenant-Scoping Middleware

## Status: ✅ COMPLETE

## What Was Done

### 1. Schema Fixes & Refinements

**Fixed Duplicate Index Warnings:**
- Removed duplicate `ownerUserId` index from Vendor.model.js (already indexed at schema level)
- Removed duplicate `userId` index from VendorStaff.model.js (already indexed at schema level)
- Removed duplicate `orderNumber` index from Order.model.js (already unique at schema level)

**User Model Updates:**
- Changed role enum: `'lab'` → `'laboratory'` for consistency
- Maintained vendorId field for vendor staff association
- Kept compound index for vendor staff lookups

**Schemas Verified (All with proper vendorId scoping):**
- ✅ Vendor - Multi-tenant vendor accounts
- ✅ VendorStaff - Vendor staff with permissions
- ✅ Product - Pharmacy products (vendor-scoped)
- ✅ LabTest - Laboratory tests (vendor-scoped)
- ✅ LabPackage - Laboratory test packages (vendor-scoped)
- ✅ Order - Parent order with sub-orders per vendor
- ✅ Commission - Platform commission settings
- ✅ Payout - Vendor payout tracking
- ✅ Review - Customer reviews (vendor-scoped)
- ✅ Cart - Patient shopping cart
- ✅ Slot - Laboratory booking slots (vendor-scoped)
- ✅ AuditLog - Audit trail for sensitive actions

All schemas have proper compound indexes including vendorId for tenant isolation.

### 2. Authentication & Authorization

**Auth Controller Updates:**
- Removed duplicate `'lab'` role mapping
- Kept only `'laboratory'` for consistency
- Maintained profile model lookups for doctor, laboratory, pharmacy roles

**Auth Middleware Enhancements:**
- Fixed duplicate pharmacy verification check
- Added vendor_owner and vendor_staff role verification
- Checks vendor status (pending/rejected/suspended) before allowing access
- Proper error messages for each status

**Middleware Chain:**
1. `protect` - JWT verification (access token)
2. `protectRefresh` - JWT verification (refresh token)
3. `restrictTo` - Role-based access control
4. `checkVerificationStatus` - Verification status re-check
5. `scopeByVendor` - Vendor scoping (Vendor.middleware.js)
6. `checkVendorPermission` - Vendor staff permission checks
7. `checkVendorStatus` - Vendor status verification

### 3. Vendor Scoping Middleware (Already Existed)

**File: Backend/Middleware/Vendor.middleware.js**

- `scopeByVendor` - Attaches vendorId to request for vendor users
- `verifyVendorAccess` - Verifies vendor ownership or staff access
- `checkVendorPermission` - Checks vendor staff permissions (fixed async issue)
- `checkVendorStatus` - Verifies vendor is approved and not suspended
- `addVendorFilter` - Helper to add vendor filter to queries

### 4. Audit Log Service (New)

**File: Backend/Services/auditLogService.js**

- `createAuditLog` - Creates audit log entries for sensitive actions
- `getVendorAuditLogs` - Get audit logs for a specific vendor
- `getUserAuditLogs` - Get audit logs for a specific user
- `getEntityAuditLogs` - Get audit logs for a specific entity

Actions tracked:
- vendor_approved, vendor_rejected, vendor_suspended, vendor_reactivated
- prescription_verified, prescription_rejected
- report_uploaded
- order_status_changed, booking_status_changed
- payout_processed, payout_paid
- staff_added, staff_removed, staff_permissions_changed
- product_created, product_updated, product_deleted
- test_created, test_updated, test_deleted
- package_created, package_updated, package_deleted

### 5. Multi-Tenancy Rules Enforced

✅ Every vendor-owned document carries `vendorId`
✅ All vendor API routes must use `scopeByVendor` middleware
✅ Compound indexes include vendorId on all vendor-scoped collections
✅ Vendor type is `pharmacy` or `laboratory`
✅ Vendor owners and staff can only access their own data
✅ Super admin can access all vendors

## Schema Summary

### Vendor System Models
- **Vendor** - Vendor accounts (pharmacy/laboratory)
- **VendorStaff** - Vendor staff with permissions
- **Commission** - Platform commission settings
- **Payout** - Vendor payout tracking

### Pharmacy Models
- **Product** - Pharmacy products (vendor-scoped)
- **Order** (sub-orders) - Pharmacy orders

### Laboratory Models
- **LabTest** - Laboratory tests (vendor-scoped)
- **LabPackage** - Test packages (vendor-scoped)
- **Slot** - Booking slots (vendor-scoped)
- **LabBooking** - Laboratory bookings

### Shared Models
- **Order** - Parent order with sub-orders per vendor
- **Cart** - Patient shopping cart
- **Review** - Customer reviews (vendor-scoped)
- **AuditLog** - Audit trail

### Existing Models (Extended)
- **User** - Added vendorId field, vendor_owner and vendor_staff roles
- **Doctor** - Unchanged
- **Laboratory** - Unchanged (legacy role, will migrate to vendor system)
- **Pharmacy** - Unchanged (legacy role, will migrate to vendor system)

## Next Steps: Phase 2 - Vendor Onboarding and Approval Flow

Phase 2 will implement:
1. Vendor registration API
2. Super admin vendor approval/rejection
3. Vendor public profile pages
4. Vendor status management (approve/reject/suspend)
5. Integration with existing auth system

## Assumptions

1. Legacy `laboratory` and `pharmacy` roles in User model will be gradually migrated to the new vendor system
2. Existing Laboratory and Pharmacy models will coexist during transition
3. All new vendor accounts will use the Vendor model exclusively
4. The platform will support both legacy and new systems during migration period
