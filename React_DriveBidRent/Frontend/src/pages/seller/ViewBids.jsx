import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance.util';

const ViewBids = () => {
  const { id } = useParams();
  const [bids, setBids] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await axiosInstance.get(`/seller/view-bids/${id}`);
        if (response.data.success) {
          setBids(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError('Failed to load bids');
      }
    };
    fetchBids();
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    try {
      const response = await axiosInstance.put(`/seller/accept-bid/${bidId}`);
      if (response.data.success) {
        setSuccess('Bid accepted successfully!');
        setBids(bids.map(bid => 
          bid._id === bidId ? { ...bid, status: 'accepted' } : bid
        ));
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to accept bid');
    }
  };

  const handleRejectBid = async (bidId) => {
    try {
      const response = await axiosInstance.put(`/seller/reject-bid/${bidId}`);
      if (response.data.success) {
        setSuccess('Bid rejected successfully!');
        setBids(bids.map(bid => 
          bid._id === bidId ? { ...bid, status: 'rejected' } : bid
        ));
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to reject bid');
    }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'Not specified';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
          <Link to="/seller/view-auctions" className="text-orange-600 hover:text-orange-700 font-medium">
            Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-orange-600">Vehicle Bids</h1>
          <Link 
            to="/seller/view-auctions" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
          >
            Back to Auctions
          </Link>
        </div>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 text-center font-medium">
            {success}
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">No bids found for this vehicle.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => (
              <div key={bid._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Bid by: {bid.bidderName}</h3>
                    <p className="text-gray-600">Email: {bid.bidderEmail}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bid Amount:</span>
                    <span className="font-bold text-orange-600 text-lg">
                      ₹{bid.bidAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bid Date:</span>
                    <span className="font-medium">{formatDate(bid.bidDate)}</span>
                  </div>
                </div>

                {bid.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptBid(bid._id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      Accept Bid
                    </button>
                    <button
                      onClick={() => handleRejectBid(bid._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                    >
                      Reject Bid
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBids;