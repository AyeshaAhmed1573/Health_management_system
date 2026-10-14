import VendorStaff from '../Models/VendorStaff.model.js';
import User from '../Models/User.model.js';
import AuditLog from '../Models/AuditLog.model.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';

// Invite staff member
export async function inviteStaff(vendorId, staffData, inviterId) {
  const session = await VendorStaff.startSession();
  session.startTransaction();

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: staffData.email }).session(session);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(staffData.password, salt);

    // Create user account
    const user = await User.create([{
      name: staffData.name,
      email: staffData.email,
      passwordHash,
      phone: staffData.phone,
      role: 'vendor_staff',
      vendorId,
      isVerified: true,
    }], { session });

    // Create staff record
    const staff = await VendorStaff.create([{
      vendorId,
      userId: user[0]._id,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role,
      permissions: staffData.permissions || [],
      status: 'active',
      invitedBy: inviterId,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return { user: user[0], staff: staff[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// Get all staff for a vendor
export async function getVendorStaff(vendorId, filters = {}) {
  const query = { vendorId };

  if (filters.status) query.status = filters.status;
  if (filters.role) query.role = filters.role;

  const staff = await VendorStaff.find(query)
    .populate('userId', 'name email phone')
    .populate('invitedBy', 'name')
    .sort({ createdAt: -1 });

  return staff;
}

// Get staff by ID
export async function getStaffById(staffId, vendorId) {
  const staff = await VendorStaff.findOne({ _id: staffId, vendorId })
    .populate('userId', 'name email phone')
    .populate('invitedBy', 'name');

  if (!staff) {
    throw new Error('Staff not found');
  }

  return staff;
}

// Update staff permissions
export async function updateStaffPermissions(staffId, vendorId, permissions, updaterId) {
  const staff = await VendorStaff.findOneAndUpdate(
    { _id: staffId, vendorId },
    { permissions },
    { new: true, runValidators: true }
  );

  if (!staff) {
    throw new Error('Staff not found');
  }

  // Log audit
  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: 'staff_permissions_changed',
    entityType: 'VendorStaff',
    entityId: staffId,
    changes: { permissions },
    previousState: { permissions: staff.permissions },
    newState: { permissions },
  });

  return staff;
}

// Update staff status (activate/deactivate)
export async function updateStaffStatus(staffId, vendorId, status, updaterId) {
  const staff = await VendorStaff.findOneAndUpdate(
    { _id: staffId, vendorId },
    { status },
    { new: true, runValidators: true }
  );

  if (!staff) {
    throw new Error('Staff not found');
  }

  // Log audit
  await AuditLog.create({
    userId: updaterId,
    vendorId,
    action: status === 'active' ? 'staff_added' : 'staff_removed',
    entityType: 'VendorStaff',
    entityId: staffId,
    newState: { status },
  });

  return staff;
}

// Remove staff member
export async function removeStaff(staffId, vendorId, removerId) {
  const staff = await VendorStaff.findOneAndDelete({ _id: staffId, vendorId });

  if (!staff) {
    throw new Error('Staff not found');
  }

  // Deactivate user account
  await User.findByIdAndUpdate(staff.userId, { vendorId: null });

  // Log audit
  await AuditLog.create({
    userId: removerId,
    vendorId,
    action: 'staff_removed',
    entityType: 'VendorStaff',
    entityId: staffId,
  });

  return staff;
}

// Staff login
export async function loginStaff(email, password) {
  const user = await User.findOne({ email, role: 'vendor_staff' }).select('+passwordHash');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const staff = await VendorStaff.findOne({ userId: user._id }).populate('vendorId');
  if (!staff) {
    throw new Error('Staff record not found');
  }

  if (staff.status !== 'active') {
    throw new Error('Your staff account is inactive');
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    vendorId: staff.vendorId._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
    vendorId: staff.vendorId._id,
  });

  return { user, staff, accessToken, refreshToken };
}
