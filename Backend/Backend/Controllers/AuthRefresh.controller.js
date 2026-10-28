import { generateAccessToken } from '../utils/auth.js';

// Refresh access token using refresh token
export async function refreshTokenController(req, res) {
  try {
    const user = req.user;

    // Generate new access token
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
      vendorId: user.vendorId,
    });

    res.status(200).json({
      success: true,
      data: { accessToken },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
}

// Logout - clear refresh token cookie
export async function logoutController(req, res) {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
}
