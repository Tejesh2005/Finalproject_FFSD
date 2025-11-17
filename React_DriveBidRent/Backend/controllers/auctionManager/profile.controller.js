// controllers/auctionManager/profile.controller.js
import User from '../../models/User.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getProfile = async (req, res) => {
  res.json(send(true, 'Profile loaded', req.user));
};

export const updatePhone = async (req, res) => {
  const { phone } = req.body;
  if (!/^\d{10}$/.test(phone)) {
    return res.json(send(false, 'Invalid phone number'));
  }

  try {
    await User.findByIdAndUpdate(req.user._id, { phone });
    res.json(send(true, 'Phone updated'));
  } catch (err) {
    console.error('Phone update error:', err);
    res.json(send(false, 'Failed to update phone'));
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 8) {
    return res.json(send(false, 'Invalid password'));
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!await user.comparePassword(oldPassword)) {
      return res.json(send(false, 'Incorrect current password'));
    }

    user.password = newPassword;
    await user.save();
    res.json(send(true, 'Password changed'));
  } catch (err) {
    console.error('Password change error:', err);
    res.json(send(false, 'Server error'));
  }
};