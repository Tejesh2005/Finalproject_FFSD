// client/src/pages/auctionManager/ManagerProfile.jsx
import { useState, useEffect } from 'react';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function ManagerProfile() {
  const [user, setUser] = useState({});
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', msg: '' });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getProfile();
        const responseData = res.data || res;
        if (responseData.success) {
          setUser(responseData.data);
          setPhone(responseData.data.phone || '');
        } else {
          showAlert('error', responseData.message || 'Failed to load profile');
        }
      } catch (err) {
        showAlert('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ show: true, type, msg });
    setTimeout(() => setAlert({ show: false, type: '', msg: '' }), 3000);
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      showAlert('error', 'Phone number must be 10 digits');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.updatePhone(phone);
      const responseData = res.data || res;
      if (responseData.success) {
        showAlert('success', 'Phone updated successfully');
        setUser({ ...user, phone });
      } else {
        showAlert('error', responseData.message || 'Failed to update phone');
      }
    } catch (err) {
      showAlert('error', 'Failed to update phone');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showAlert('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showAlert('error', 'Password must be at least 8 characters');
      return;
    }
    if (!oldPassword) {
      showAlert('error', 'Please enter your current password');
      return;
    }
    try {
      setUpdating(true);
      const res = await auctionManagerServices.changePassword({ oldPassword, newPassword });
      const responseData = res.data || res;
      if (responseData.success) {
        showAlert('success', 'Password changed successfully');
        setOldPassword(''); 
        setNewPassword(''); 
        setConfirmPassword('');
      } else {
        showAlert('error', responseData.message || 'Failed to change password');
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div className="max-w-6xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Auction Manager Profile</h2>

      {alert.show && (
        <div className={`p-4 rounded-lg mb-6 text-center font-medium ${alert.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
          {alert.msg}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white p-8 rounded-xl shadow-lg border border-orange-600">
          <h3 className="text-2xl font-bold text-orange-600 mb-6 border-b-2 border-orange-600 pb-3">Personal Details</h3>
          <form onSubmit={handlePhoneUpdate} className="space-y-6">
            <div>
              <strong className="block text-gray-700 mb-1">Full Name:</strong>
              <span className="text-lg">{user.firstName} {user.lastName}</span>
            </div>
            <div>
              <strong className="block text-gray-700 mb-1">Email:</strong>
              <div className="bg-gray-100 p-3 rounded-lg text-gray-600 flex items-center justify-between">
                <span>{user.email}</span>
                <span className="text-xs text-gray-500 italic">(Cannot be changed)</span>
              </div>
            </div>
            <div>
              <strong className="block text-gray-700 mb-1">Role:</strong>
              <div className="bg-gray-100 p-3 rounded-lg text-gray-700 font-semibold">{user.userType?.replace(/_/g, ' ').toUpperCase()}</div>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                pattern="[0-9]{10}"
                maxLength="10"
                placeholder="Enter 10-digit phone number"
                required
              />
              <small className="text-gray-600 block mt-1">10 digits only</small>
            </div>
            <button 
              type="submit" 
              disabled={updating}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Updating...' : 'Update Phone'}
            </button>
          </form>
        </div>

        <div className="flex-1 bg-white p-8 rounded-xl shadow-lg border border-orange-600">
          <h3 className="text-2xl font-bold text-orange-600 mb-6 border-b-2 border-orange-600 pb-3">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Current Password:</label>
              <input 
                type="password" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" 
                placeholder="Enter your current password"
                required 
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">New Password:</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" 
                minLength="8"
                required 
              />
              <small className="text-gray-600 block mt-1">Must be at least 8 characters</small>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Confirm New Password:</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition" 
                placeholder="Re-enter new password"
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={updating}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}