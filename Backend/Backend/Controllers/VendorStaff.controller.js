import {
  inviteStaff,
  getVendorStaff,
  getStaffById,
  updateStaffPermissions,
  updateStaffStatus,
  removeStaff,
  loginStaff,
} from '../Services/vendorStaffService.js';

// Invite staff member
export async function inviteStaffController(req, res) {
  try {
    const { staffData } = req.body;
    const { user, staff } = await inviteStaff(req.user.vendorId, staffData, req.user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        staff: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
          permissions: staff.permissions,
          status: staff.status,
        },
      },
      message: 'Staff member invited successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get all staff for vendor
export async function getVendorStaffController(req, res) {
  try {
    const { status, role } = req.query;
    const staff = await getVendorStaff(req.user.vendorId, { status, role });

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Get staff by ID
export async function getStaffByIdController(req, res) {
  try {
    const { staffId } = req.params;
    const staff = await getStaffById(staffId, req.user.vendorId);

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

// Update staff permissions
export async function updateStaffPermissionsController(req, res) {
  try {
    const { staffId } = req.params;
    const { permissions } = req.body;

    const staff = await updateStaffPermissions(staffId, req.user.vendorId, permissions, req.user.id);

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff permissions updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Update staff status
export async function updateStaffStatusController(req, res) {
  try {
    const { staffId } = req.params;
    const { status } = req.body;

    const staff = await updateStaffStatus(staffId, req.user.vendorId, status, req.user.id);

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff status updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Remove staff member
export async function removeStaffController(req, res) {
  try {
    const { staffId } = req.params;
    const staff = await removeStaff(staffId, req.user.vendorId, req.user.id);

    res.status(200).json({
      success: true,
      data: staff,
      message: 'Staff member removed successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

// Staff login
export async function loginStaffController(req, res) {
  try {
    const { email, password } = req.body;

    const { user, staff, accessToken, refreshToken } = await loginStaff(email, password);

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
          vendorId: staff.vendorId._id,
        },
        staff: {
          id: staff._id,
          name: staff.name,
          role: staff.role,
          permissions: staff.permissions,
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
