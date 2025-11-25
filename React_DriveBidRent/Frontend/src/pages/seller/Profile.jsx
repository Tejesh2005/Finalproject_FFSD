// client/src/pages/seller/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const Profile = () => {
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
    const fetchProfileData = async () => {
      try {
        const profileRes = await axiosInstance.get('/seller/profile');
        if (profileRes.data.success) {
          setUser(profileRes.data.data);
        }

        const earningsRes = await axiosInstance.get('/seller/view-earnings');
        if (earningsRes.data.success) {
          const { totalRentalEarnings, totalAuctionEarnings, recentEarnings } = earningsRes.data.data;
          setTotalEarnings(totalRentalEarnings + totalAuctionEarnings);
          setRecentTransactions(recentEarnings);
        }

        // Optional: fetch counts
        const auctionsRes = await axiosInstance.get('/seller/view-auctions');
        if (auctionsRes.data.success) setAuctionsCount(auctionsRes.data.data.length);

        const rentalsRes = await axiosInstance.get('/seller/view-rentals');
        if (rentalsRes.data.success) setRentalsCount(rentalsRes.data.data.length);
      } catch (err) {
        setError('Failed to load profile data');
      }
    };
    fetchProfileData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/seller/update-profile', user);
      if (res.data.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/seller/update-preferences', {
        notificationPreference: user.notificationPreference,
      });
      if (res.data.success) {
        setSuccess('Preferences updated successfully!');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to update preferences');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
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
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

 