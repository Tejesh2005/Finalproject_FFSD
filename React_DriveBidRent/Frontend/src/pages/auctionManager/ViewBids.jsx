// client/src/pages/auctionManager/ViewBids.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function ViewBids() {
  const { id } = useParams();
  const [currentBid, setCurrentBid] = useState(null);
  const [pastBids, setPastBids] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ending, setEnding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
  const res = await auctionManagerServices.viewBids(id);
        const responseData = res.data || res;
        
        if (responseData.success) {
          const { auction, currentBid: cBid, pastBids: pBids } = responseData.data || {};
          // set the car/auction info
          setCar(auction || null);

          // set current and past bids separately
          setCurrentBid(cBid || null);
          setPastBids(Array.isArray(pBids) ? pBids : []);
        } else {
          setError(responseData.message || 'Failed to load bids');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, [id]);

  const endAuction = async () => {
    if (!window.confirm('Are you sure you want to end this auction?')) return;
    
    try {
      setEnding(true);
  const res = await auctionManagerServices.stopAuction(id);
      const responseData = res.data || res;
      
      if (responseData.success) {
        alert('Auction ended successfully!');
        window.location.reload();
      } else {
        alert(responseData.message || 'Failed to end auction');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to end auction');
    } finally {
      setEnding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading bids..." />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Car not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">View Bids</h2>
      
  <div className="bg-white rounded-xl p-6 shadow-lg mb-8 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="w-64 h-48 overflow-hidden rounded-lg mr-6">
            <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
            <p className="text-lg text-orange-600 font-bold mt-1">
              Condition: {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
            </p>
            <p className="text-gray-600 mt-2">Starting Bid: ₹{car.startingBid}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/auction-manager/approved')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600 transition"
          >
            Back to Cars
          </button>

          {/* Show Stop Auction only when auction is not already stopped */}
          {!(car && car.auction_stopped === true) && (
            <button
              onClick={endAuction}
              disabled={ending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ending ? 'Ending Auction...' : 'Stop Auction'}
            </button>
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Bids on {car.vehicleName}</h3>

        {/* Current bid */}
        {currentBid ? (
          <div className="current-bid bg-gray-50 p-6 rounded-md border-l-4 border-orange-500 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-extrabold text-orange-600">₹{currentBid.bidAmount}</div>
                <div className="mt-2 text-gray-700 font-semibold">
                  Bidder: {currentBid.buyerId?.firstName || ''} {currentBid.buyerId?.lastName || ''} ({currentBid.buyerId?.email || ''})
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Time: {new Date(currentBid.bidTime).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="current-bid bg-gray-50 p-6 rounded-md border-l-4 border-gray-200 mb-6 text-center text-gray-500 italic">
            {car && car.started_auction === 'yes' ? 'No one bided on this car till now.' : 'No bids placed yet'}
          </div>
        )}

        {/* Past bids */}
        {pastBids && pastBids.length > 0 && (
          <>
            <div className="text-lg font-semibold text-gray-800 mb-4">Bid History (Last {pastBids.length})</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastBids.map((bid) => (
                <div key={bid._id} className="past-bid-card bg-gray-50 p-4 rounded-md border-l-4 border-blue-500">
                  <div className="text-xl font-bold text-blue-600 mb-2">₹{bid.bidAmount}</div>
                  <div className="text-sm text-gray-700 font-semibold">Bidder: {bid.buyerId?.firstName || ''} {bid.buyerId?.lastName || ''} ({bid.buyerId?.email || ''})</div>
                  <div className="text-sm text-gray-500 mt-2">Time: {new Date(bid.bidTime).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}