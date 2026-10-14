import Vendor from '../Models/Vendor.model.js';
import VendorStaff from '../Models/VendorStaff.model.js';

// Middleware to scope queries by vendorId for vendor users
// This ensures vendors can only access their own data
export function scopeByVendor(req, res, next) {
  const user = req.user;

  // Only apply to vendor roles
  if (user?.role === 'vendor_owner' || user?.role === 'vendor_staff') {
    if (!user.vendorId) {
      return res.status(403).json({
        success: false,
        error: 'Vendor ID not found for user. Please contact support.',
      });
    }
    // Attach vendorId to request for use in controllers
    req.vendorId = user.vendorId;
  }

  next();
}

// Middleware to verify vendor ownership or staff access
export async function verifyVendorAccess(req, res, next) {
  try {
    const user = req.user;
    const targetVendorId = req.params.vendorId || req.body.vendorId;

    // Super admin can access all vendors
    if (user?.role === 'super_admin') {
      return next();
    }

    // Vendor owner can only access their own vendor
    if (user?.role === 'vendor_owner') {
      if (user.vendorId?.toString() !== targetVendorId) {
        return res.status(403).json({
          success: false,
          error: 'You can only access your own vendor data.',
        });
      }
      return next();
    }

    // Vendor staff can only access their assigned vendor
    if (user?.role === 'vendor_staff') {
      const staff = await VendorStaff.findOne({ userId: user.id });
      if (!staff || staff.vendorId.toString() !== targetVendorId) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this vendor.',
        });
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Unauthorized access.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Error verifying vendor access.',
    });
  }
}

// Middleware to check vendor staff permissions
export function checkVendorPermission(...requiredPermissions) {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Vendor owners have all permissions
      if (user?.role === 'vendor_owner') {
        return next();
      }

      // Super admin has all permissions
      if (user?.role === 'super_admin') {
        return next();
      }

      // Check vendor staff permissions
      if (user?.role === 'vendor_staff') {
        const staff = await VendorStaff.findOne({ userId: user.id }).populate('vendorId');
        
        if (!staff) {
          return res.status(403).json({
            success: false,
            error: 'Staff record not found.',
          });
        }

        // Check if staff is active
        if (staff.status !== 'active') {
          return res.status(403).json({
            success: false,
            error: 'Your staff account is inactive.',
          });
        }

        // Check if staff has all required permissions
        const hasAllPermissions = requiredPermissions.every(perm =>
          staff.permissions.includes(perm)
        );

        if (!hasAllPermissions) {
          return res.status(403).json({
            success: false,
            error: `Missing required permissions: ${requiredPermissions.join(', ')}`,
          });
        }

        // Attach staff details to request
        req.staff = staff;
        return next();
      }

      return res.status(403).json({
        success: false,
        error: 'Unauthorized access.',
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions.',
      });
    }
  };
}

// Middleware to check if vendor is approved
export async function checkVendorStatus(req, res, next) {
  try {
    const user = req.user;

    if (user?.role === 'vendor_owner' || user?.role === 'vendor_staff') {
      const vendor = await Vendor.findById(user.vendorId);

      if (!vendor) {
        return res.status(403).json({
          success: false,
          error: 'Vendor not found.',
        });
      }

      if (vendor.status === 'pending') {
        return res.status(403).json({
          success: false,
          error: 'Your vendor registration is pending approval.',
        });
      }

      if (vendor.status === 'rejected') {
        return res.status(403).json({
          success: false,
          error: `Your vendor registration has been rejected. Reason: ${vendor.rejectionReason || 'Not specified'}`,
        });
      }

      if (vendor.status === 'suspended') {
        return res.status(403).json({
          success: false,
          error: `Your vendor account has been suspended. Reason: ${vendor.suspendedReason || 'Not specified'}`,
        });
      }

      // Attach vendor to request
      req.vendor = vendor;
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Error checking vendor status.',
    });
  }
}

// Helper function to add vendor filter to queries
export function addVendorFilter(query, vendorId) {
  if (vendorId) {
    query.vendorId = vendorId;
  }
  return query;
}
