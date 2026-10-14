# Phase 2 API Reference: Vendor Onboarding and Approval

## Vendor Authentication

### Register Vendor
**Endpoint:** `POST /api/vendors/register`
**Content-Type:** `multipart/form-data`
**Public:** Yes
**Description:** Register a new vendor (pharmacy or laboratory) with file uploads

**Request Body (FormData):**
```
vendorData: JSON string {
  businessName: string (required, min 2 chars)
  type: 'pharmacy' | 'laboratory' (required)
  licenseNumber: string (required, min 5 chars)
  description: string (optional)
  address: {
    street: string (required)
    city: string (required)
    province: string (optional)
    postalCode: string (optional)
  } (required)
  city: string (required, min 2 chars)
  serviceArea: string[] (optional)
  contactInfo: {
    phone: string (required)
    email: string (optional)
    whatsapp: string (optional)
  } (required)
  operatingHours: {
    monday: { open: string, close: string, closed: boolean }
    tuesday: { open: string, close: string, closed: boolean }
    wednesday: { open: string, close: string, closed: boolean }
    thursday: { open: string, close: string, closed: boolean }
    friday: { open: string, close: string, closed: boolean }
    saturday: { open: string, close: string, closed: boolean }
    sunday: { open: string, close: string, closed: boolean }
  } (optional)
  deliveryAvailable: boolean (optional, default: true)
  deliveryAreas: [{ area: string, charge: number }] (optional, pharmacy only)
  homeCollectionAvailable: boolean (optional, default: false)
  homeCollectionFee: number (optional, default: 0, laboratory only)
}
ownerData: JSON string {
  name: string (required, min 2 chars)
  email: string (required, valid email)
  password: string (required, min 8 chars)
  phone: string (required, min 10 chars)
} (required)
licenseDocument: File (optional, pdf/doc/docx, max 5MB)
logo: File (optional, jpeg/jpg/png/gif/webp, max 5MB)
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "vendor_owner"
    },
    "vendor": {
      "id": "string",
      "businessName": "string",
      "type": "pharmacy | laboratory",
      "status": "pending"
    }
  },
  "message": "Vendor registration submitted. Pending admin approval."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation error message"
}
```

---

### Login Vendor
**Endpoint:** `POST /api/vendors/login`
**Content-Type:** `application/json`
**Public:** Yes
**Description:** Login as vendor owner

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "vendor_owner",
      "vendorId": "string"
    },
    "vendor": {
      "id": "string",
      "businessName": "string",
      "type": "pharmacy | laboratory",
      "status": "approved | pending | rejected | suspended"
    },
    "accessToken": "string"
  },
  "message": "Login successful"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Note:** Refresh token is set in HTTP-only cookie

---

## Vendor Profile Management

### Get Vendor Profile
**Endpoint:** `GET /api/vendors/profile`
**Auth:** Required (vendor_owner)
**Middleware:** `protect`, `restrictTo('vendor_owner')`
**Description:** Get current vendor's profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "ownerUserId": { "name": "string", "email": "string", "phone": "string" },
    "businessName": "string",
    "type": "pharmacy | laboratory",
    "licenseNumber": "string",
    "licenseDocumentUrl": "string",
    "description": "string",
    "logoUrl": "string",
    "address": { "street": "string", "city": "string", "province": "string", "postalCode": "string" },
    "city": "string",
    "serviceArea": ["string"],
    "contactInfo": { "phone": "string", "email": "string", "whatsapp": "string" },
    "operatingHours": { "monday": { "open": "string", "close": "string", "closed": false }, ... },
    "status": "approved | pending | rejected | suspended",
    "rating": { "average": 0, "count": 0 },
    "deliveryAvailable": true,
    "deliveryAreas": [{ "area": "string", "charge": 0 }],
    "homeCollectionAvailable": false,
    "homeCollectionFee": 0,
    "commissionRate": 0,
    "payoutDetails": { "bankName": "string", "accountNumber": "string", "accountHolderName": "string", "ifscCode": "string" },
    "approvedAt": "2024-01-01T00:00:00.000Z",
    "approvedBy": "string",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Vendor Profile
**Endpoint:** `PUT /api/vendors/profile`
**Auth:** Required (vendor_owner)
**Middleware:** `protect`, `restrictTo('vendor_owner')`, `scopeByVendor`, `checkVendorStatus`
**Content-Type:** `application/json`
**Description:** Update vendor profile

**Request Body:** (partial update allowed)
```json
{
  "description": "string",
  "logoUrl": "string",
  "contactInfo": {
    "phone": "string",
    "email": "string",
    "whatsapp": "string"
  },
  "operatingHours": { ... },
  "deliveryAvailable": true,
  "deliveryAreas": [{ "area": "string", "charge": 0 }],
  "homeCollectionAvailable": false,
  "homeCollectionFee": 0,
  "payoutDetails": {
    "bankName": "string",
    "accountNumber": "string",
    "accountHolderName": "string",
    "ifscCode": "string"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated vendor object */ },
  "message": "Vendor profile updated successfully"
}
```

---

## Vendor Public API (Patient-facing)

### Search Approved Vendors
**Endpoint:** `GET /api/vendors/public/search`
**Auth:** Not required
**Query Parameters:**
- `type`: 'pharmacy' | 'laboratory' (optional)
- `city`: string (optional)
- `serviceArea`: string (optional)
- `search`: string (optional, searches business name and description)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "_id": "string",
        "businessName": "string",
        "type": "pharmacy | laboratory",
        "description": "string",
        "logoUrl": "string",
        "address": { "street": "string", "city": "string", "province": "string", "postalCode": "string" },
        "city": "string",
        "serviceArea": ["string"],
        "contactInfo": { "phone": "string", "email": "string", "whatsapp": "string" },
        "operatingHours": { ... },
        "rating": { "average": 4.5, "count": 100 },
        "deliveryAvailable": true,
        "deliveryAreas": [{ "area": "string", "charge": 0 }],
        "homeCollectionAvailable": false,
        "homeCollectionFee": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

### Get Public Vendor Profile
**Endpoint:** `GET /api/vendors/public/:vendorId`
**Auth:** Not required
**Description:** Get public profile of an approved vendor

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "businessName": "string",
    "type": "pharmacy | laboratory",
    "description": "string",
    "logoUrl": "string",
    "address": { ... },
    "city": "string",
    "serviceArea": ["string"],
    "contactInfo": { ... },
    "operatingHours": { ... },
    "rating": { "average": 4.5, "count": 100 },
    "deliveryAvailable": true,
    "deliveryAreas": [{ "area": "string", "charge": 0 }],
    "homeCollectionAvailable": false,
    "homeCollectionFee": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Vendor not found or not approved"
}
```

---

## Super Admin Vendor Management

### List Vendors
**Endpoint:** `GET /api/vendors/admin/list`
**Auth:** Required (super_admin)
**Middleware:** `protect`, `restrictTo('super_admin')`
**Query Parameters:**
- `type`: 'pharmacy' | 'laboratory' (optional)
- `status`: 'pending' | 'approved' | 'rejected' | 'suspended' (optional)
- `city`: string (optional)
- `search`: string (optional, searches business name and license number)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "_id": "string",
        "ownerUserId": { "name": "string", "email": "string", "phone": "string" },
        "businessName": "string",
        "type": "pharmacy | laboratory",
        "licenseNumber": "string",
        "licenseDocumentUrl": "string",
        "description": "string",
        "logoUrl": "string",
        "address": { ... },
        "city": "string",
        "serviceArea": ["string"],
        "contactInfo": { ... },
        "operatingHours": { ... },
        "status": "pending | approved | rejected | suspended",
        "rejectionReason": "string",
        "suspendedReason": "string",
        "rating": { "average": 4.5, "count": 100 },
        "deliveryAvailable": true,
        "deliveryAreas": [{ "area": "string", "charge": 0 }],
        "homeCollectionAvailable": false,
        "homeCollectionFee": 0,
        "commissionRate": 0,
        "payoutDetails": { ... },
        "approvedAt": "2024-01-01T00:00:00.000Z",
        "approvedBy": "string",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

---

### Approve Vendor
**Endpoint:** `PUT /api/vendors/admin/:vendorId/approve`
**Auth:** Required (super_admin)
**Middleware:** `protect`, `restrictTo('super_admin')`
**Content-Type:** `application/json`
**Description:** Approve a pending vendor application

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated vendor object */ },
  "message": "Vendor approved successfully"
}
```

**Effects:**
- Sets vendor status to 'approved'
- Sets approvedAt and approvedBy
- Sets user.isVerified to true
- Creates audit log entry

---

### Reject Vendor
**Endpoint:** `PUT /api/vendors/admin/:vendorId/reject`
**Auth:** Required (super_admin)
**Middleware:** `protect`, `restrictTo('super_admin')`
**Content-Type:** `application/json`
**Description:** Reject a vendor application

**Request Body:**
```json
{
  "reason": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated vendor object */ },
  "message": "Vendor rejected successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Rejection reason is required"
}
```

**Effects:**
- Sets vendor status to 'rejected'
- Sets rejectionReason
- Creates audit log entry

---

### Suspend Vendor
**Endpoint:** `PUT /api/vendors/admin/:vendorId/suspend`
**Auth:** Required (super_admin)
**Middleware:** `protect`, `restrictTo('super_admin')`
**Content-Type:** `application/json`
**Description:** Suspend an approved vendor

**Request Body:**
```json
{
  "reason": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated vendor object */ },
  "message": "Vendor suspended successfully"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Suspension reason is required"
}
```

**Effects:**
- Sets vendor status to 'suspended'
- Sets suspendedReason
- Creates audit log entry
- Vendor can no longer access dashboard

---

### Reactivate Vendor
**Endpoint:** `PUT /api/vendors/admin/:vendorId/reactivate`
**Auth:** Required (super_admin)
**Middleware:** `protect`, `restrictTo('super_admin')`
**Content-Type:** `application/json`
**Description:** Reactivate a suspended vendor

**Request Body:**
```json
{
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated vendor object */ },
  "message": "Vendor reactivated successfully"
}
```

**Effects:**
- Sets vendor status to 'approved'
- Clears suspendedReason
- Creates audit log entry
- Vendor can access dashboard again

---

## File Upload Endpoints

### Upload Vendor Documents
**Endpoint:** `POST /api/vendors/register` (includes file upload)
**Content-Type:** `multipart/form-data`
**Max File Size:** 5MB per file
**Allowed File Types:**
- `licenseDocument`: pdf, doc, docx
- `logo`: jpeg, jpg, png, gif, webp

**File Storage:**
- License documents: `/public/uploads/licenses/`
- Logos: `/public/uploads/logos/`

**File Naming:** `{fieldname}-{timestamp}-{random}.{ext}`

---

## Error Responses

All endpoints may return:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Error message describing validation or business logic error"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "No token provided" | "Token expired" | "Invalid token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access restricted to: role1, role2" | "Vendor not found" | "Your vendor registration is pending admin approval"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Vendor not found" | "Vendor not found or not approved"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Server error message"
}
```

---

## Status Flow

```
pending (registration submitted)
  ↓
approved (by super admin) ←→ suspended (by super admin)
  ↓                          ↓
active                      can be reactivated
```

Rejected vendors cannot be reactivated - they must re-register.

---

## Security Notes

1. **JWT Tokens:**
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry (HTTP-only cookie)
   - Tokens include: id, role, vendorId

2. **Role-Based Access:**
   - vendor_owner: Can manage their own vendor
   - vendor_staff: Limited permissions within their vendor
   - super_admin: Can manage all vendors
   - patient: Can only view public vendor profiles

3. **Tenant Scoping:**
   - All vendor-specific routes use `scopeByVendor` middleware
   - Vendors can only access their own data
   - Super admin can access all vendor data

4. **File Upload Security:**
   - File type validation by field name
   - MIME type checking
   - File size limit (5MB)
   - Unique filename generation

5. **Audit Logging:**
   - All admin actions (approve, reject, suspend, reactivate) are logged
   - Audit logs include: userId, vendorId, action, entityType, entityId, changes, reason
