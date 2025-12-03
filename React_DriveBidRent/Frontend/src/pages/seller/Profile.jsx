// client/src/pages/seller/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance.util';
import { updateMyProfile } from '../../redux/slices/profileSlice';
import useProfile from '../../hooks/useProfile';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile: reduxProfile, loading: profileLoading, refresh } = useProfile();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    doorNo: '',
    street: '',
    city: '',
    state: '',
    notificationPreference: 'all',
  });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [auctionsCount, setAuctionsCount] = useState(0);
  const [rentalsCount, setRentalsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordMatch, setPasswordMatch] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  // Auto-hide messages after 4 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success, error]);

  useEffect(() => {
    if (reduxProfile) {
      setUser(reduxProfile);
    }
  }, [reduxProfile]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch all data in parallel for faster loading
        const [earningsRes, auctionsRes, rentalsRes] = await Promise.all([
          axiosInstance.get('/seller/view-earnings'),
          axiosInstance.get('/seller/view-auctions'),
          axiosInstance.get('/seller/view-rentals')
        ]);

        if (earningsRes.data.success) {
          const { totalRentalEarnings, totalAuctionEarnings, recentEarnings } = earningsRes.data.data;
          setTotalEarnings(totalRentalEarnings + totalAuctionEarnings);
          setRecentTransactions(recentEarnings);
        }

        if (auctionsRes.data.success) setAuctionsCount(auctionsRes.data.data.length);
        if (rentalsRes.data.success) setRentalsCount(rentalsRes.data.data.length);
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lastName') {
      const numbersOnlyRegex = /^\d+$/;
      if (value && numbersOnlyRegex.test(value)) {
        setLastNameError('Last name cannot contain only numbers');
      } else {
        setLastNameError('');
      }
    }
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!value) {
      setPasswordStrength('');
    } else if (!strongRegex.test(value)) {
      setPasswordStrength('❌ Weak: needs uppercase, number, special char');
    } else {
      setPasswordStrength('✅ Strong password');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (!value) {
      setPasswordMatch('');
    } else if (newPassword !== value) {
      setPasswordMatch('❌ Passwords do not match');
    } else {
      setPasswordMatch('✅ Passwords match');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (lastNameError) {
      setError('Last name cannot contain only numbers');
      return;
    }
    if (!user.firstName || user.firstName.trim() === '') {
      setError('First name is required');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (user.phone && !phoneRegex.test(user.phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    if (user.phone && user.phone === reduxProfile.phone) {
      setError('New phone number cannot be the same as current phone number');
      return;
    }
    try {
      const result = await dispatch(updateMyProfile(user)).unwrap();
      setSuccess('Profile updated successfully!');
      setUser(result);
    } catch (err) {
      setError(err || 'Failed to update profile');
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(updateMyProfile({ notificationPreference: user.notificationPreference })).unwrap();
      setSuccess('Preferences updated successfully!');
      setUser(result);
    } catch (err) {
      setError(err || 'Failed to update preferences');
    }
  };

  if (loading || profileLoading) return <LoadingSpinner />;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!oldPassword) {
      setError('Please enter your current password');
      return;
    }
    
    if (oldPassword === newPassword) {
      setError('New password cannot be the same as current password');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(newPassword)) {
      setError('Password must include uppercase letter, number, and special character');
      return;
    }

    try {
      const res = await axiosInstance.post('/seller/change-password', {
        oldPassword,
        newPassword,
      });
      if (res.data.success) {
        setSuccess('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength('');
        setPasswordMatch('');
        refresh();
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Seller Profile</h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6 text-center">{success}</div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6 text-center">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Personal Information</h2>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={user.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={user.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    {lastNameError && <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>❌ {lastNameError}</div>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={user.phone}
                    onChange={handleProfileChange}
                    pattern="[0-9]{10}"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <h3 className="text-lg font-semibold text-orange-600 mt-6 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Door/Flat No</label>
                    <input
                      type="text"
                      name="doorNo"
                      value={user.doorNo}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street/Area</label>
                    <input
                      type="text"
                      name="street"
                      value={user.street}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={user.city}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border rounded-lg cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={user.state}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700"
                >
                  Save Changes
                </button>
              </form>
            </div>

            {/* Listings Overview - MOVED BELOW */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Listings Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-orange-600">Active Auctions</h3>
                  <p className="text-2xl font-bold">Total: {auctionsCount}</p>
                  <Link
                    to="/seller/view-auctions"
                    className="inline-block mt-2 bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                  >
                    View Auctions
                  </Link>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-lg font-medium text-orange-600">Active Rentals</h3>
                  <p className="text-2xl font-bold">Total: {rentalsCount}</p>
                  <Link
                    to="/seller/view-rentals"
                    className="inline-block mt-2 bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                  >
                    View Rentals
                  </Link>
                </div>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Earnings Summary</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-lg">
                  <strong>Total Earnings:</strong> ₹{totalEarnings.toLocaleString('en-IN')}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Recent Transactions (Completed):</strong>
                </p>
                {recentTransactions.length > 0 ? (
                  <ul className="mt-2 text-sm">
                    {recentTransactions.map((t, i) => (
                      <li key={i}>
                        ₹{t.amount.toLocaleString('en-IN')} - {t.description} (
                        {new Date(t.createdAt).toLocaleDateString()})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No recent completed transactions</p>
                )}
                <Link
                  to="/seller/view-earnings"
                  className="inline-block mt-4 bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700"
                >
                  View All Earnings
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Preferences + Password */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Preferences</h2>
              <form onSubmit={handlePreferencesSubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Preferences
                </label>
                <select
                  name="notificationPreference"
                  value={user.notificationPreference}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border rounded-lg mb-4"
                >
                  <option value="all">All Notifications</option>
                  <option value="important">Only Important</option>
                  <option value="none">None</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700"
                >
                  Save Preferences
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4">Change Password</h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {passwordStrength && (
                    <div style={{ color: passwordStrength.includes('✅') ? 'green' : 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {passwordStrength}
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {passwordMatch && (
                    <div style={{ color: passwordMatch.includes('✅') ? 'green' : 'red', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      {passwordMatch}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;