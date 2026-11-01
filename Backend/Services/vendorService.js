import Vendor from '../Models/Vendor.model.js';
import User from '../Models/User.model.js';
import VendorStaff from '../Models/VendorStaff.model.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';
import { createAuditLog } from './auditLogService.js';
import bcrypt from 'bcrypt';

// Register a new vendor
export async function registerVendor(vendorData, ownerData) {
  const session = await Vendor.startSession();
  session.startTransaction();

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: ownerData.email }).session(session);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Check if license number already exists
    const existingVendor = await Vendor.findOne({ licenseNumber: vendorData.licenseNumber }).session(session);
    if (existingVendor) {
      throw new Error('License number already registered');
    }

    // Create user account for vendor owner
    const user = await User.create([{
      name: ownerData.name,
      email: ownerData.email,
      passwordHash: ownerData.passwordHash,
      phone: ownerData.phone,
      role: 'vendor_owner',
      isVerified: false,
    }], { session });

    // Create vendor
    const vendor = await Vendor.create([{
      ownerUserId: user[0]._id,
      businessName: vendorData.businessName,
      type: vendorData.type,
      licenseNumber: vendorData.licenseNumber,
      licenseDocumentUrl: vendorData.licenseDocumentUrl,
      description: vendorData.description,
      logoUrl: vendorData.logoUrl,
      address: vendorData.address,
      city: vendorData.city,
      serviceArea: vendorData.serviceArea,
      contactInfo: vendorData.contactInfo,
      operatingHours: vendorData.operatingHours,
      status: 'pending',
      deliveryAvailable: vendorData.deliveryAvailable,
      deliveryAreas: vendorData.deliveryAreas,
      homeCollectionAvailable: vendorData.homeCollectionAvailable,
      homeCollectionFee: vendorData.homeCollectionFee,
    }], { session });

    // Update user with vendorId
    await User.findByIdAndUpdate(user[0]._id, { vendorId: vendor[0]._id }, { session });

    await session.commitTransaction();
    session.endSession();

    return { user: user[0], vendor: vendor[0] };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

// Login vendor owner
export async function loginVendor(email, password) {
  const user = await User.findOne({ email, role: 'vendor_owner' }).select('+passwordHash');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  const vendor = await Vendor.findOne({ ownerUserId: user._id });
  if (!vendor) {
    throw new Error('Vendor not found');
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
    vendorId: vendor._id,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
    vendorId: vendor._id,
  });

  return { user, vendor, accessToken, refreshToken };
}

// Get vendor by ID
export async function getVendorById(vendorId) {
  const vendor = await Vendor.findById(vendorId).populate('ownerUserId', 'name email phone');
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  return vendor;
}

// Get vendor by owner user ID
export async function getVendorByOwnerId(ownerUserId) {
  const vendor = await Vendor.findOne({ ownerUserId }).populate('ownerUserId', 'name email phone');
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  return vendor;
}

// Update vendor profile
export async function updateVendorProfile(vendorId, updateData) {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  
  return vendor;
}

// Approve vendor (super admin)
export async function approveVendor(vendorId, adminId, reason) {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null,
    },
    { new: true }
  );

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Update user verification status
  await User.findByIdAndUpdate(vendor.ownerUserId, { isVerified: true });

  // Log audit
  await createAuditLog({
    userId: adminId,
    vendorId,
    action: 'vendor_approved',
    entityType: 'Vendor',
    entityId: vendorId,
    newState: { status: 'approved' },
    reason,
  });

  return vendor;
}

// Reject vendor (super admin)
export async function rejectVendor(vendorId, adminId, reason) {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      status: 'rejected',
      rejectionReason: reason,
    },
    { new: true }
  );

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Log audit
  await createAuditLog({
    userId: adminId,
    vendorId,
    action: 'vendor_rejected',
    entityType: 'Vendor',
    entityId: vendorId,
    newState: { status: 'rejected', rejectionReason: reason },
    reason,
  });

  return vendor;
}

// Suspend vendor (super admin)
export async function suspendVendor(vendorId, adminId, reason) {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      status: 'suspended',
      suspendedReason: reason,
    },
    { new: true }
  );

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Log audit
  await createAuditLog({
    userId: adminId,
    vendorId,
    action: 'vendor_suspended',
    entityType: 'Vendor',
    entityId: vendorId,
    newState: { status: 'suspended', suspendedReason: reason },
    reason,
  });

  return vendor;
}

// Reactivate vendor (super admin)
export async function reactivateVendor(vendorId, adminId, reason) {
  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    {
      status: 'approved',
      suspendedReason: null,
    },
    { new: true }
  );

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  // Log audit
  await createAuditLog({
    userId: adminId,
    vendorId,
    action: 'vendor_reactivated',
    entityType: 'Vendor',
    entityId: vendorId,
    newState: { status: 'approved' },
    reason,
  });

  return vendor;
}

// List vendors with filters
export async function listVendors(filters = {}, page = 1, limit = 20) {
  const query = {};
  
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.city) query.city = filters.city;
  if (filters.search) {
    query.$or = [
      { businessName: { $regex: filters.search, $options: 'i' } },
      { licenseNumber: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  
  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .populate('ownerUserId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(query),
  ]);

  return {
    vendors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Get public vendor profile (for patients)
export async function getPublicVendorProfile(vendorId) {
  const vendor = await Vendor.findOne({
    _id: vendorId,
    status: 'approved',
  }).select('-payoutDetails -commissionRate');

  if (!vendor) {
    throw new Error('Vendor not found or not approved');
  }

  return vendor;
}

// Search approved vendors (for patients)
export async function searchApprovedVendors(filters = {}, page = 1, limit = 20) {
  const query = { status: 'approved' };
  
  if (filters.type) query.type = filters.type;
  if (filters.city) query.city = filters.city;
  if (filters.serviceArea) query.serviceArea = { $in: [filters.serviceArea] };
  if (filters.search) {
    query.$or = [
      { businessName: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  
  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .select('-payoutDetails -commissionRate')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Vendor.countDocuments(query),
  ]);

  return {
    vendors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
