// client/src/pages/mechanic/profile/Profile.jsx
import { useEffect, useState } from 'react';
import { getProfile, changePassword } from '../../../services/mechanic.services';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'success' | 'error'
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getProfile().then(res => setUser(res.data.data.user));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.oldPassword) errs.oldPassword = 'Required';
    if (!form.newPassword || form.newPassword.length < 8) errs.newPassword = 'Min 8 chars';
    if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setMsg('');
    setMsgType('');
    try {
  const res = await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
      const data = res.data || res;
      if (data && data.success) {
        setMsg(data.message || 'Password changed successfully');
        setMsgType('success');
        setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
      } else {
        // API responded but with success:false
        setMsg((data && data.message) || 'Failed to change password');
        setMsgType('error');
      }
    } catch (err) {
      // Network or server error
      const message = err?.response?.data?.message || 'Failed to change password';
      setMsg(message);
      setMsgType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <div className="text-center py-20 text-xl">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-orange-600 text-center mb-8">Mechanic Profile</h2>

      {msg && (
        <div className={`p-4 rounded text-center mb-6 ${msgType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-xl border border-orange-600 shadow">
          <h3 className="text-xl font-bold text-orange-600 mb-4">Personal Details</h3>
          <div className="space-y-3">
            {['firstName', 'lastName', 'email', 'phone', 'shopName', 'experienceYears'].map(field => (
              <div key={field} className="flex">
                <span className="font-semibold w-32 capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                <span>{user[field] || 'Not provided'}</span>
              </div>
            ))}
            <div className="flex">
              <span className="font-semibold w-32">Services:</span>
              <span>
                {user.repairCars && user.repairBikes ? 'Cars & Bikes' :
                 user.repairCars ? 'Cars' : user.repairBikes ? 'Bikes' : 'Not specified'}
              </span>
            </div>
            <div className="flex">
              <span className="font-semibold w-32">Status:</span>
              <span className={user.approved_status === 'Yes' ? 'text-green-600' : 'text-yellow-600'}>
                {user.approved_status === 'Yes' ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            {user.googleAddressLink && (
              <div className="flex">
                <span className="font-semibold w-32">Map:</span>
                <a href={user.googleAddressLink} target="_blank" className="text-orange-600 hover:underline">View on Google Maps</a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-orange-600 shadow">
          <h3 className="text-xl font-bold text-orange-600 mb-4">Change Password</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password" placeholder="Current Password" required
                className="w-full p-3 border rounded"
                value={form.oldPassword} onChange={e => setForm({ ...form, oldPassword: e.target.value })}
              />
              {errors.oldPassword && <p className="text-red-600 text-sm mt-1">{errors.oldPassword}</p>}
            </div>
            <div>
              <input
                type="password" placeholder="New Password" required
                className="w-full p-3 border rounded"
                value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })}
              />
              {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
            </div>
            <div>
              <input
                type="password" placeholder="Confirm New Password" required
                className="w-full p-3 border rounded"
                value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-orange-600 text-white py-3 rounded hover:bg-orange-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}