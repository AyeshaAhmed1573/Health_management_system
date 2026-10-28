import bcrypt from 'bcrypt';
import {
  registerVendor,
  loginVendor,
  getVendorById,
  getVendorByOwnerId,
  updateVendorProfile,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  listVendors,
  getPublicVendorProfile,
  searchApprovedVendors,
} from '../Services/vendorService.js';
import { validateVendorRegistration, formatValidationErrors } from '../utils/validators.js';

// Register new vendor
export async function registerVendorController(req, res) {
  try {
    const { vendorData, ownerData } = req.body;

    // Parse JSON strings if they're stringified
    const parsedVendorData = typeof vendorData === 'string' ? JSON.parse(vendorData) : vendorData;
    const parsedOwnerData = typeof ownerData === 'string' ? JSON.parse(ownerData) : ownerData;

    // Validate registration data
    const validationErrors = validateVendorRegistration({
      ...parsedVendorData,
      ownerData: parsedOwnerData,
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: formatValidationErrors(validationErrors),
      });
    }

    // Add file URLs if uploaded
    if (req.files) {
      if (req.files.licenseDocument && req.files.licenseDocument[0]) {
        parsedVendorData.licenseDocumentUrl = `/uploads/licenses/${req.files.licenseDocument[0].filename}`;
      }
      if (req.files.logo && req.files.logo[0]) {
        parsedVendorData.logoUrl = `/uploads/logos/${req.files.logo[0].filename}`;
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(parsedOwnerData.password, salt);

    const { user, vendor } = await registerVendor(parsedVendorData, {
      ...parsedOwnerData,
      passwordHash,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          type: vendor.type,
          status: vendor.status,
        },
      },
      message: 'Vendor registration submitted. Pending admin approval.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Login vendor
export async function loginVendorController(req, res) {
  try {
    const { email, password } = req.body;

    const { user, vendor, accessToken, refreshToken } = await loginVendor(email, password);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorId: vendor._id,
        },
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName,
          type: vendor.type,
          status: vendor.status,
        },
        accessToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
}

// Get current vendor profile
export async function getVendorProfileController(req, res) {
  try {
    const vendor = await getVendorByOwnerId(req.user.id);
    
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

// Update vendor profile
export async function updateVendorProfileController(req, res) {
  try {
    const vendor = await updateVendorProfile(req.user.vendorId, req.body);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor profile updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Approve vendor (super admin)
export async function approveVendorController(req, res) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await approveVendor(vendorId, req.user.id, reason);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor approved successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Reject vendor (super admin)
export async function rejectVendorController(req, res) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required',
      });
    }

    const vendor = await rejectVendor(vendorId, req.user.id, reason);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor rejected successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Suspend vendor (super admin)
export async function suspendVendorController(req, res) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason is required',
      });
    }

    const vendor = await suspendVendor(vendorId, req.user.id, reason);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor suspended successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Reactivate vendor (super admin)
export async function reactivateVendorController(req, res) {
  try {
    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await reactivateVendor(vendorId, req.user.id, reason);
    
    res.status(200).json({
      success: true,
      data: vendor,
      message: 'Vendor reactivated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// List vendors (super admin)
export async function listVendorsController(req, res) {
  try {
    const { type, status, city, search, page = 1, limit = 20 } = req.query;

    const result = await listVendors(
      { type, status, city, search },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get public vendor profile (for patients)
export async function getPublicVendorProfileController(req, res) {
  try {
    const { vendorId } = req.params;
    const vendor = await getPublicVendorProfile(vendorId);
    
    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

// Search approved vendors (for patients)
export async function searchApprovedVendorsController(req, res) {
  try {
    const { type, city, serviceArea, search, page = 1, limit = 20 } = req.query;

    const result = await searchApprovedVendors(
      { type, city, serviceArea, search },
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}
