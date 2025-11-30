import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const RentalDetails = () => {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRental = async () => {
      try {
        const response = await axiosInstance.get(`/seller/rental-details/${id}`);
        if (response.data.success) {
          setRental(response.data.data.rental);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load rental details');
      }
    };
    fetchRental();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
          <Link to="/seller/view-rentals" className="text-orange-600 hover:text-orange-700 font-medium">
            Back to Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-orange-600 mb-10">Rental Vehicle Details</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6">
              <img 
                src={rental.vehicleImage} 
                alt={rental.vehicleName} 
                className="w-full h-auto rounded-lg shadow-md mb-6"
              />
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{rental.vehicleName}</h2>
                <p className="text-lg text-gray-700 mb-1">Cost per day: ₹{rental.costPerDay?.toLocaleString('en-IN')}</p>
                <p className="text-lg text-gray-700">Location: {rental.location}</p>
              </div>
            </div>
            
            <div className="md:w-1/2 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Vehicle Specifications</h2>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="text-gray-900">{rental.year}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">AC:</span>
                  <span className="text-gray-900">{rental.ac ? 'Available' : 'Not Available'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Capacity:</span>
                  <span className="text-gray-900">{rental.capacity} passengers</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="text-gray-900 capitalize">{rental.condition}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Fuel Type:</span>
                  <span className="text-gray-900 capitalize">{rental.fuelType}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Transmission:</span>
                  <span className="text-gray-900 capitalize">{rental.transmission}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Driver Available:</span>
                  <span className="text-gray-900">{rental.driverAvailable ? 'Yes' : 'No'}</span>
                </div>
                {rental.driverAvailable && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-700">Driver Rate:</span>
                    <span className="text-gray-900">₹{rental.driverRate?.toLocaleString('en-IN')}/day</span>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex gap-4">
                <Link 
                  to="/seller/view-rentals" 
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200"
                >
                  Back to Rentals
                </Link>
                <Link 
                  to={`/seller/edit-rental/${rental._id}`} 
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200"
                >
                  Edit Rental
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalDetails;