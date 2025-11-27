import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const AddAuction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-mileage': '',
    'fuel-type': '',
    'transmission': '',
    'vehicle-condition': '',
    'auction-date': '',
    'starting-bid': '',
    vehicleImage: null,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const validate = () => {
    if (formData['vehicle-name'].trim().length < 2) return 'Vehicle name must be ≥ 2 chars';
    if (!formData.vehicleImage?.type.startsWith('image/')) return 'Valid image required';
    if (formData['vehicle-year'] < 1900 || formData['vehicle-year'] > new Date().getFullYear())
      return 'Year must be 1900–current';
    if (formData['vehicle-mileage'] <= 0) return 'Mileage > 0';
    if (!formData['fuel-type']) return 'Select fuel type';
    if (!formData['transmission']) return 'Select transmission';
    if (!formData['vehicle-condition']) return 'Select condition';
    if (!formData['auction-date']) return 'Select auction date';
    if (new Date(formData['auction-date']) < new Date().setHours(0, 0, 0, 0))
      return 'Auction date must be today or later';
    if (formData['starting-bid'] <= 0) return 'Starting bid > 0';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setIsSubmitting(true);
    setError('');
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    try {
      const res = await axiosInstance.post('/seller/add-auction', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        navigate('/seller/view-auctions');
      } else {
        setError(res.data.message || 'Failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">
          Add Vehicle for Auction
        </h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Vehicle Name</label>
            <input
              name="vehicle-name"
              value={formData['vehicle-name']}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">Vehicle Image</label>
            <input
              type="file"
              name="vehicleImage"
              onChange={handleChange}
              accept="image/*"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                name="vehicle-year"
                value={formData['vehicle-year']}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Mileage (km)</label>
              <input
                type="number"
                name="vehicle-mileage"
                value={formData['vehicle-mileage']}
                onChange={handleChange}
                min="0"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                name="fuel-type"
                value={formData['fuel-type']}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Transmission</label>
              <select
                name="transmission"
                value={formData['transmission']}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Condition</label>
              <select
                name="vehicle-condition"
                value={formData['vehicle-condition']}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              >
                <option value="">Select</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Auction Date</label>
              <input
                type="date"
                name="auction-date"
                value={formData['auction-date']}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Starting Bid (₹)</label>
              <input
                type="number"
                name="starting-bid"
                value={formData['starting-bid']}
                onChange={handleChange}
                min="0"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Auction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddAuction;