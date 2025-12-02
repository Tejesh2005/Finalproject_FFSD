import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const UpdateRental = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    'vehicle-ac': '',
    'vehicle-condition': '',
    'rental-cost': '',
    'driver-available': '',
    'driver-rate': '',
    'availability': ''
  });
  const [readOnlyData, setReadOnlyData] = useState({
    'vehicle-name': '',
    'vehicle-year': '',
    'vehicle-capacity': '',
    'vehicle-fuel-type': '',
    'vehicle-transmission': '',
    vehicleImage: null
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReturnButton, setShowReturnButton] = useState(false);
  const [isRentalActive, setIsRentalActive] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          const rental = response.data.data.rental;
          // Editable fields
          setFormData({
            'vehicle-ac': rental.ac ? 'available' : 'not',
            'vehicle-condition': rental.condition || '',
            'rental-cost': rental.costPerDay || '',
            'driver-available': rental.driverAvailable ? 'yes' : 'no',
            'driver-rate': rental.driverRate || '',
            'availability': rental.status || 'unavailable'
          });
          // Read-only fields
          setReadOnlyData({
            'vehicle-name': rental.vehicleName || '',
            'vehicle-year': rental.year || '',
            'vehicle-capacity': rental.capacity || '',
            'vehicle-fuel-type': rental.fuelType || '',
            'vehicle-transmission': rental.transmission || '',
            vehicleImage: rental.vehicleImage || null
          });

          // Check if rental is completed
          if (rental.dropDate && rental.buyerId) {
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            const pickupDate = new Date(rental.pickupDate);
            pickupDate.setHours(0, 0, 0, 0);
            const dropDate = new Date(rental.dropDate);
            dropDate.setHours(0, 0, 0, 0);
            
            // Check if rental is active or upcoming (current date <= drop date and rental exists)
            const isRentalPending = currentDate <= dropDate;
            setIsRentalActive(isRentalPending);
            
            // Show return button only after drop date
            setShowReturnButton(currentDate > dropDate && rental.status === 'unavailable');
          }
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };
    fetchRental();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    setError(null);

    if (!formData['vehicle-ac']) {
      setError('Please select AC availability.');
      isValid = false;
    }
    if (!formData['vehicle-condition']) {
      setError('Please select vehicle condition.');
      isValid = false;
    }
    if (!formData['rental-cost']) {
      setError('Cost per day is required.');
      isValid = false;
    }
    const cost = parseFloat(formData['rental-cost']);
    if (isNaN(cost) || cost <= 0) {
      setError('Cost per day must be a positive number.');
      isValid = false;
    }
    if (!formData['driver-available']) {
      setError('Please select driver availability.');
      isValid = false;
    }
    if (formData['driver-available'] === 'yes' && !formData['driver-rate']) {
      setError('Driver rate is required when driver is available.');
      isValid = false;
    }
    if (formData['driver-available'] === 'yes') {
      const driverRate = parseFloat(formData['driver-rate']);
      if (isNaN(driverRate) || driverRate <= 0) {
        setError('Driver rate must be a positive number.');
        isValid = false;
      }
    }
    if (!formData['availability']) {
      setError('Please select availability status.');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const submitData = new FormData();
    // Only send editable fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        submitData.append(key, formData[key]);
      }
    });
    try {
      const response = await axiosInstance.put(`/seller/update-rental/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess('Rental updated successfully!');
        setError(null);
        setTimeout(() => navigate('/seller/view-rentals'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsReturned = async () => {
    if (!window.confirm('Mark this rental as returned and make it available for new bookings?')) {
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`/seller/rental/mark-returned/${id}`);
      if (response.data.success) {
        setSuccess('Vehicle marked as returned and is now available for rent!');
        setTimeout(() => navigate('/seller/view-rentals'), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to mark rental as returned. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">Update Rental Vehicle</h1>
        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center font-medium">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center font-medium">{success}</div>}
        {isRentalActive && (
          <div className="bg-yellow-100 border-2 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6 text-center font-semibold">
            ⚠️ This vehicle is currently rented. You cannot update its details until the rental period ends. Please return the car first to make any changes.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          {/* Read-Only Section */}
          <div className={`bg-blue-50 p-6 rounded-lg border border-blue-200 ${isRentalActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="inline-block mr-2 px-3 py-1 bg-blue-200 rounded-full text-sm font-semibold">Fixed Details</span>
              These details cannot be changed
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Name */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Vehicle Name</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-name']}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={readOnlyData['vehicle-year']}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={readOnlyData['vehicle-capacity']}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Fuel Type</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-fuel-type'] ? readOnlyData['vehicle-fuel-type'].charAt(0).toUpperCase() + readOnlyData['vehicle-fuel-type'].slice(1) : ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Transmission */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Transmission</label>
                <input
                  type="text"
                  value={readOnlyData['vehicle-transmission'] ? readOnlyData['vehicle-transmission'].charAt(0).toUpperCase() + readOnlyData['vehicle-transmission'].slice(1) : ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              {/* Image */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Current Image</label>
                {readOnlyData.vehicleImage && (
                  <img
                    src={readOnlyData.vehicleImage}
                    alt="Vehicle"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Editable Section */}
          <div className={`bg-green-50 p-6 rounded-lg border border-green-200 ${isRentalActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
              <span className="inline-block mr-2 px-3 py-1 bg-green-200 rounded-full text-sm font-semibold">Editable Details</span>
              Update the details below
            </h2>

            <div className="space-y-6">
              {/* AC */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">AC Availability <span className="text-red-500">*</span></label>
                <select
                  name="vehicle-ac"
                  value={formData['vehicle-ac']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                >
                  <option value="">Select AC Availability</option>
                  <option value="available">Available</option>
                  <option value="not">Not Available</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
                <select
                  name="vehicle-condition"
                  value={formData['vehicle-condition']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                >
                  <option value="">Select Condition</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              {/* Cost Per Day */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Cost per Day (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="rental-cost"
                  value={formData['rental-cost']}
                  onChange={handleChange}
                  required
                  min="1"
                  step="0.01"
                  placeholder="Enter daily rental cost"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                />
              </div>

              {/* Driver Available */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Driver Available <span className="text-red-500">*</span></label>
                <select
                  name="driver-available"
                  value={formData['driver-available']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                >
                  <option value="">Select Driver Availability</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              {/* Driver Rate */}
              {formData['driver-available'] === 'yes' && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2">Driver Rate (₹/day) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="driver-rate"
                    value={formData['driver-rate']}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    placeholder="Enter driver daily rate"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  />
                </div>
              )}

              {/* Availability */}
              <div>
                <label className="block font-medium text-gray-700 mb-2">Availability for Rentals <span className="text-red-500">*</span></label>
                <select
                  name="availability"
                  value={formData['availability']}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                >
                  <option value="">Select Availability</option>
                  <option value="available">Available (Show in Rentals)</option>
                  <option value="unavailable">Unavailable (Hidden from Rentals)</option>
                </select>
                <p className="text-sm text-gray-600 mt-2 bg-yellow-50 p-2 rounded">
                  <strong>Note:</strong> Set to "Available" to show this vehicle in the rental listings for buyers. Set to "Unavailable" to hide it (e.g., during maintenance or updates).
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isRentalActive}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {isRentalActive ? 'Cannot Update - Vehicle is Rented' : (isSubmitting ? 'Updating...' : 'Update Rental')}
          </button>
          {showReturnButton && (
            <button
              type="button"
              onClick={handleMarkAsReturned}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-70 transition-all duration-200 shadow-md hover:shadow-lg mt-3"
            >
              {isSubmitting ? 'Processing...' : '✓ Mark as Returned & Make Available'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UpdateRental;