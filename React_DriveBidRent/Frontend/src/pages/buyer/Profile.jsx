import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useBuyerHooks';

export default function Profile() {
  const { profile, loading, updateProfile, changePassword } = useProfile();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    doorNo: '',
    street: '',
    city: '',
    state: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [successAlert, setSuccessAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('Password must be at least 8 characters, include uppercase, number, and special character');
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        doorNo: profile.doorNo || '',
        street: profile.street || '',
        city: profile.city || '',
        state: profile.state || ''
      });
    }
  }, [profile]);

  const showAlert = (message, type) => {
    if (type === 'success') {
      setSuccessAlert(message);
      setErrorAlert('');
    } else {
      setErrorAlert(message);
      setSuccessAlert('');
    }
    
    setTimeout(() => {
      setSuccessAlert('');
      setErrorAlert('');
    }, 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(profileForm.phone)) {
      showAlert('Phone number must be exactly 10 digits', 'error');
      return;
    }

    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        showAlert(result.message, 'success');
      } else {
        showAlert(result.message || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.', 'error');
      console.error('Profile update error:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongRegex.test(passwordForm.newPassword)) {
      showAlert('Password must be at least 8 characters and include an uppercase letter, number, and special character', 'error');
      return;
    }

    try {
      const result = await changePassword(passwordForm);
      if (result.success) {
        showAlert(result.message, 'success');
        setPasswordForm({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
        setConfirmMessage('');
      } else {
        showAlert(result.message || 'Failed to change password.', 'error');
      }
    } catch (error) {
      showAlert('An error occurred. Please try again.', 'error');
      console.error('Password change error:', error);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));

    if (field === 'newPassword') {
      const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      
      if (!value) {
        setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
      } else if (!strongRegex.test(value)) {
        setPasswordStrength('Weak password: must include uppercase letter, number, and special character');
      } else {
        setPasswordStrength('Strong password');
      }
    }

    if (field === 'confirmPassword') {
      if (!value) {
        setConfirmMessage('');
      } else if (passwordForm.newPassword !== value) {
        setConfirmMessage('Passwords do not match');
      } else {
        setConfirmMessage('Passwords match');
      }
    }
  };

  const handlePhoneInput = (value) => {
    const numbersOnly = value.replace(/\D/g, '');
    const truncated = numbersOnly.slice(0, 10);
    handleProfileChange('phone', truncated);
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <section className="profile-settings">
      <h2>Profile Settings</h2>

      {successAlert && <div className="alert alert-success show">{successAlert}</div>}
      {errorAlert && <div className="alert alert-danger show">{errorAlert}</div>}

      <div className="profile-container">
        {/* Personal Details */}
        <div className="profile-details">
          <h3>Personal Details</h3>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className="form-control"
                value={profileForm.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                className="form-control"
                value={profileForm.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                className="form-control"
                value={profileForm.phone}
                onChange={(e) => handlePhoneInput(e.target.value)}
                required
              />
              <div className="field-info">Must be 10 digits</div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={profileForm.email}
                readOnly
              />
              <div className="field-info">Email cannot be changed</div>
            </div>

            <div className="form-group">
              <label htmlFor="doorNo">Door/Flat No</label>
              <input
                type="text"
                id="doorNo"
                className="form-control"
                value={profileForm.doorNo}
                onChange={(e) => handleProfileChange('doorNo', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="street">Street/Area</label>
              <input
                type="text"
                id="street"
                className="form-control"
                value={profileForm.street}
                onChange={(e) => handleProfileChange('street', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                className="form-control"
                value={profileForm.city}
                onChange={(e) => handleProfileChange('city', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                className="form-control"
                value={profileForm.state}
                onChange={(e) => handleProfileChange('state', e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-block">Save Changes</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="change-password">
          <h3>Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="old-password">Current Password</label>
              <input
                type="password"
                id="old-password"
                className="form-control"
                value={passwordForm.oldPassword}
                onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                className="form-control"
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                required
              />
              <div className={`password-strength ${
                passwordStrength.includes('Weak') ? 'strength-weak' : 
                passwordStrength.includes('Strong') ? 'strength-strong' : ''
              }`}>
                {passwordStrength}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                className="form-control"
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                required
              />
              <div className={`password-strength ${
                confirmMessage.includes('match') ? 'strength-weak' : 
                confirmMessage.includes('match') ? 'strength-strong' : ''
              }`}>
                {confirmMessage}
              </div>
            </div>

            <button type="submit" className="btn btn-block">Change Password</button>
          </form>
        </div>
      </div>
    </section>
  );
}