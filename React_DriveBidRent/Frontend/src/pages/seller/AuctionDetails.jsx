import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const AuctionDetails = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState(null);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'Not specified';

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await axiosInstance.get(`/seller/auction-details/${id}`);
        if (response.data.success) {
          setAuction(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load auction details');
      }
    };
    fetchAuction();
  }, [id]);

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        <Link to="/seller/view-auctions" className="text-orange-600 hover:text-orange-700 font-medium">
          &larr; Back to All Auctions
        </Link>
      </div>
    </div>
  );
  
  if (!auction) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-xl text-gray-600">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/seller/view-auctions" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 font-medium">
          &larr; Back to All Auctions
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <h1 className="text-3xl font-bold">{auction.vehicleName || 'Vehicle Details'}</h1>
          </div>
          
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <img 
                src={auction.vehicleImage || 'https://via.placeholder.com/500x350?text=No+Image'} 
                alt={auction.vehicleName || 'Vehicle image'} 
                className="w-full h-auto rounded-lg shadow-md"
              />
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-orange-600 mb-2">{auction.vehicleName || 'Unnamed Vehicle'}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status:</span>
                  <span className={`font-bold ${
                    auction.status === 'pending' ? 'text-yellow-600' :
                    auction.status === 'approved' ? 'text-green-600' :
                    auction.status === 'rejected' ? 'text-red-600' :
                    auction.status === 'assignedMechanic' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {capitalize(auction.status || 'pending')}
                  </span>
                </div>
                {auction.status === 'pending' && (
                  <p className="text-yellow-600 font-medium">Your request is under review</p>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Year:</span>
                  <span className="text-gray-900">{auction.year || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Mileage:</span>
                  <span className="text-gray-900">{auction.mileage ? `${auction.mileage} km` : 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Fuel Type:</span>
                  <span className="text-gray-900">{capitalize(auction.fuelType || 'Not specified')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Transmission:</span>
                  <span className="text-gray-900">{capitalize(auction.transmission || 'Not specified')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Condition:</span>
                  <span className="text-gray-900">{capitalize(auction.condition || 'Not specified')}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Auction Date:</span>
                  <span className="text-gray-900">{formatDate(auction.auctionDate)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Starting Bid:</span>
                  <span className="text-gray-900">{auction.startingBid ? `₹${auction.startingBid.toLocaleString('en-IN')}` : 'Not specified'}</span>
                </div>
              </div>
              
              {(auction.status === 'approved' || auction.status === 'assignedMechanic') && (
                <Link 
                  to={`/seller/view-bids/${auction._id}`} 
                  className="inline-block mt-6 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  View Bids
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;