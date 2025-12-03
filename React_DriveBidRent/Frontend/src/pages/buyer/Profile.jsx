import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useBuyerHooks';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [lastNameError, setLastNameError] = useState('');

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

  const handleProfileChange = (field, value) => {
    if (field === 'lastName') {
      const numbersOnlyRegex = /^\d+$/;
      if (value && numbersOnlyRegex.test(value)) {
        setLastNameError('Last name cannot contain only numbers');
      } else {
        setLastNameError('');
      }
    }
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));

    if (field === 'newPassword') {
      const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!value) setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
      else if (!strongRegex.test(value)) setPasswordStrength('❌ Weak password: must include uppercase letter, number, and special character');
      else setPasswordStrength('✅ Strong password');
    }

    if (field === 'confirmPassword') {
      if (!value) setConfirmMessage('');
      else if (passwordForm.newPassword !== value) setConfirmMessage('❌ Passwords do not match');
      else setConfirmMessage('✅ Passwords match');
    }
  };

  const handlePhoneInput = (value) => {
    const numbersOnly = value.replace(/\D/g, '');
    const truncated = numbersOnly.slice(0, 10);
    handleProfileChange('phone', truncated);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.oldPassword) {
      showAlert('Please enter your current password', 'error');
      return;
    }

    if (passwordForm.oldPassword === passwordForm.newPassword) {
      showAlert('New password cannot be the same as current password', 'error');
      return;
    }

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
      const result = await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword, confirmPassword: passwordForm.confirmPassword });
      if (result && result.success) {
        showAlert(result.message || 'Password changed successfully!', 'success');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength('Password must be at least 8 characters, include uppercase, number, and special character');
        setConfirmMessage('');
      } else {
        showAlert(result?.message || 'Failed to change password.', 'error');
      }
    } catch (error) {
      showAlert(error?.message || 'An error occurred. Please try again.', 'error');
      console.error('Password change error:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (lastNameError) {
      showAlert('Last name cannot contain only numbers', 'error');
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (profileForm.phone && !phoneRegex.test(profileForm.phone)) {
      showAlert('Phone number must be exactly 10 digits', 'error');
      return;
    }

    if (profileForm.phone && profileForm.phone === profile.phone) {
      showAlert('New phone number cannot be the same as current phone number', 'error');
      return;
    }

    try {
      const result = await updateProfile(profileForm);
      if (result && result.success) {
        showAlert(result.message || 'Profile updated successfully!', 'success');
      } else {
        showAlert(result?.message || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      showAlert(error?.message || 'An error occurred. Please try again.', 'error');
      console.error('Profile update error:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const css = `
      :root {
          --primary-color: #ff6b00;
          --primary-dark: #e65c00;
          --light-bg: #f5f5f5;
          --white: #ffffff;
          --text-dark: #333333;
          --text-light: #666666;
          --border-color: #dddddd;
          --success-color: #28a745;
          --error-color: #dc3545;
      }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      .profile-settings { padding: 2rem 1rem; max-width: 1200px; margin: 0 auto; }
      .profile-settings h2 { color: var(--primary-color); font-size: 2rem; text-align: center; margin-bottom: 2rem; font-weight: 600; }
      .profile-container { display: flex; gap: 2rem; flex-wrap: wrap; }
      .profile-details, .change-password { flex: 1; min-width: 300px; background-color: var(--white); padding: 2rem; border-radius: 1rem; border: 1px solid var(--border-color); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
      .profile-details h3, .change-password h3 { color: var(--primary-color); font-size: 1.5rem; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--primary-color); }
      .form-group { margin-bottom: 1.5rem; }
      .form-group label { display:block; margin-bottom:0.5rem; font-weight:500; color:var(--text-dark); }
      .form-control { width:100%; padding:0.75rem; border:1px solid var(--border-color); border-radius:0.3rem; font-size:1rem; transition:border-color 0.3s, box-shadow 0.3s; }
      .form-control:focus { outline:none; border-color:var(--primary-color); box-shadow:0 0 0 2px rgba(255,107,0,0.2); }
      .form-control[readonly] { background-color:#f9f9f9; color:var(--text-light); cursor:not-allowed; }
      .btn { display:inline-block; background-color:var(--primary-color); color:var(--white); padding:0.75rem 2rem; border:none; border-radius:0.3rem; font-size:1rem; font-weight:500; cursor:pointer; transition:background-color 0.3s ease; text-align:center; }
      .btn:hover { background-color:var(--primary-dark); }
      .btn-block { display:block; width:100%; }
      .alert { padding:1rem; border-radius:0.3rem; margin-bottom:1.5rem; text-align:center; display:none; }
      .alert-success { background-color:#d4edda; color:#155724; border:1px solid #c3e6cb; }
      .alert-danger { background-color:#f8d7da; color:#721c24; border:1px solid #f5c6cb; }
      .field-info { font-size:0.85rem; color:var(--text-light); margin-top:0.25rem; }
      .password-strength { margin-top:0.25rem; font-size:0.85rem; }
      .strength-weak { color: var(--error-color); }
      .strength-strong { color: var(--success-color); }
      @media (max-width:768px) { .profile-container { flex-direction:column; } .profile-details, .change-password { min-width:100%; } }
  `;

  return (
    <>
      <style>{css}</style>
      <section className="profile-settings">
        <h2>Profile Settings</h2>

        {/* Blocked User Warning */}
        {profile?.isBlocked && (
          <div style={{
            backgroundColor: '#fee',
            border: '2px solid #dc3545',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#dc3545',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              Your account has been blocked
            </p>
            <p style={{
              color: '#721c24',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              marginBottom: 0
            }}>
              You can view your data but cannot place bids, book rentals, or update your profile. Please contact admin for assistance.
            </p>
          </div>
        )}

        <div className="alert alert-success" style={{ display: successAlert ? 'block' : 'none' }}>{successAlert}</div>
        <div className="alert alert-danger" style={{ display: errorAlert ? 'block' : 'none' }}>{errorAlert}</div>

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
                />
                {lastNameError && <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '0.25rem' }}>❌ {lastNameError}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="form-control"
                  value={profileForm.phone}
                  onChange={(e) => handlePhoneInput(e.target.value)}
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
                <div className={`password-strength ${passwordStrength.includes('✅') ? 'strength-strong' : passwordStrength.includes('❌') ? 'strength-weak' : ''}`}>
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
                <div className={`password-strength ${confirmMessage.includes('✅') ? 'strength-strong' : confirmMessage.includes('❌') ? 'strength-weak' : ''}`}>
                  {confirmMessage}
                </div>
              </div>

              <button type="submit" className="btn btn-block">Change Password</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}