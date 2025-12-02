// client/src/pages/seller/ViewRentals.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await axiosInstance.get('/seller/view-rentals');
        if (response.data.success) {
          setRentals(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rentals');
      }
    };
    fetchRentals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Rental Vehicles</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}

