// client/src/pages/seller/RentalDetailsAlt.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const RentalDetailsAlt = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [moneyReceived, setMoneyReceived] = useState(null);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          setRental(response.data.data.rental);
          setMoneyReceived(response.data.data.moneyReceived);
          if (response.data.data.rental.status === 'unavailable') {
            setShowPopup(true);
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

  const closePopup = () => setShowPopup(false);

  if (error) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Rental details not found</h2>
        <Link to="/seller/view-rentals" className="text-orange-600 hover:underline">
          ← Back to Rentals
        </Link>
      </div>
    );
  }

  if (!rental) return <div className="text-center py-20">Loading...</div>;

  const formattedPickupDate = rental.pickupDate 
    ? new Date(rental.pickupDate).toLocaleDateString('en-GB') 
    : 'Not specified';
  const formattedDropDate = rental.dropDate 
    ? new Date(rental.dropDate).toLocaleDateString('en-GB') 
    : 'Not specified';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-orange-600 mb-3">Rental Status</h2>
            <p className="text-gray-700 mb-4">This car has been taken by someone for rental.</p>
            <button
              onClick={closePopup}
              className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-8">Rental Vehicle Details</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Image + Basic Info */}
          <div className="space-y-6">
            <img 
              src={rental.vehicleImage} 
              alt={rental.vehicleName} 
              className="w-full h-80 object-cover rounded-lg shadow-md"
            />

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">{rental.vehicleName}</h3>
              <p className="text-gray-600">Cost per day: <strong>₹{rental.costPerDay}</strong></p>
              <p className="text-gray-600">Location: <strong>{rental.location}</strong></p>
            </div>

            {/* Rental Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">Rental Information</h3>
              {rental.status === 'unavailable' && rental.buyerId ? (
                <div className="space-y-2 text-sm">
                  <p><strong>Renter:</strong> {rental.buyerId.firstName} {rental.buyerId.lastName}</p>
           