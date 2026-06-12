import User from '../Models/User.model.js';

// GET ALL USERS (admin only)
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-passwordHash');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// GET USER BY ID
export async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// UPDATE USER
export async function updateUser(req, res) {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true }
    ).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// DELETE USER (admin only)
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}