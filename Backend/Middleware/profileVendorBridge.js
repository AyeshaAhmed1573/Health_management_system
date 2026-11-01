import Pharmacy from '../Models/Pharmacy.model.js';
import Laboratory from '../Models/Laboratory.model.js';
import Vendor from '../Models/Vendor.model.js';
import User from '../Models/User.model.js';

/**
 * Product management is built on the Vendor system (roles vendor_owner / vendor_staff),
 * but pharmacies and laboratories sign up through /api/auth/register with role "pharmacy" /
 * "laboratory" and never get a Vendor record, so their dashboard's "Manage Products" was
 * always refused (403). This middleware bridges the two: once the admin has verified the
 * profile, it finds - or creates - the matching Vendor and lets the request continue as that
 * vendor's owner.
 */
export async function bridgeProfileToVendor(req, res, next) {
  try {
    const role = req.user?.role;
    if (role !== 'pharmacy' && role !== 'laboratory') return next();

    const Profile = role === 'pharmacy' ? Pharmacy : Laboratory;
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(403).json({ success: false, error: 'Profile not found. Please contact support.' });
    }
    if (profile.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: 'Your account must be approved by an admin before you can manage products.',
      });
    }

    let vendor = profile.vendorId ? await Vendor.findById(profile.vendorId) : null;
    if (!vendor) vendor = await Vendor.findOne({ ownerUserId: req.user.id });
    if (!vendor) {
      const addr = profile.address || {};
      vendor = await Vendor.create({
        ownerUserId: req.user.id,
        businessName: profile.pharmacyName || profile.labName || 'My business',
        type: role,
        licenseNumber: profile.licenseNumber,
        address: { street: addr.street, city: addr.city, province: addr.province, postalCode: addr.postalCode },
        city: addr.city,
        status: 'approved', // the admin already verified this profile
      });
    }
    if (!profile.vendorId) {
      profile.vendorId = vendor._id;
      await profile.save();
    }
    await User.findByIdAndUpdate(req.user.id, { vendorId: vendor._id });

    // continue as the owner of this vendor
    req.user = { ...req.user, role: 'vendor_owner', vendorId: String(vendor._id) };
    next();
  } catch (err) {
    next(err);
  }
}
