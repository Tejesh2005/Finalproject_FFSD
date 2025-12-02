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
