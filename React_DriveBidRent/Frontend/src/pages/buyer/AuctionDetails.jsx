// client/src/pages/buyer/AuctionDetails.jsx
import { useState, useEffect } from 'react';
import './AuctionDetails.css';
import { useParams } from 'react-router-dom';
import { getAuctionById, placeBid } from '../../services/buyer.services';

export default function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [currentBid, setCurrentBid] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCurrentBidder, setIsCurrentBidder] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const data = await getAuctionById(id);
      setAuction(data.auction);
      setCurrentBid(data.currentBid);
      setIsCurrentBidder(data.isCurrentBidder || false);
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setError('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (isCurrentBidder) {
      setError('You already have the current bid for this auction');
      return;
    }

    if (auction?.auction_stopped) {
      setError('This auction has been stopped. Please check the auction details page.');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minBid = calculateMinBid();

    if (isNaN(bidValue) || bidValue <= 0) {
      setError('Please enter a valid bid amount.');
      return;
    }

    if (bidValue < minBid) {
      setError(`Your bid must be at least ₹${minBid.toLocaleString()}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const result = await placeBid({
        auctionId: id,
        bidAmount: bidValue
      });

      if (result.success) {
        setSuccess('Your bid has been placed successfully!');
        setBidAmount('');
        setCurrentBid({ bidAmount: bidValue });
        setIsCurrentBidder(true);
        fetchAuctionDetails();
      } else {
        setError(result.message || 'Failed to place bid. Please try again.');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateMinBid = () => {
    if (!auction) return 0;
    return currentBid ? currentBid.bidAmount + 2000 : auction.startingBid;
  };

  const handleBidAmountChange = (value) => {
    setBidAmount(value);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-3xl font-bold text-orange-600 animate-pulse">Loading auction details...</div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl text-red-600 font-bold">Auction not found</div>
      </div>
    );
  }

  const minBid = calculateMinBid();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">

      {/* Hero Header */}
      <div className="relative h-96 md:h-[420px] bg-cover bg-center bg-no-repeat mb-16"
        style={{ backgroundImage: `url(${auction.vehicleImage})`, backgroundColor: '#1a1a1a' }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
              {auction.vehicleName}
            </h1>
            <p className="text-2xl md:text-3xl text-orange-400 font-bold">
              Current Bid: ₹{currentBid ? currentBid.bidAmount.toLocaleString() : auction.startingBid.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Left Column - Auction Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-orange-100">
            <h2 className="text-4xl font-bold text-orange-600 mb-8">Auction Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 font-semibold">Seller</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {auction.seller?.firstName} {auction.seller?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Year</p>
                  <p className="text-2xl font-bold text-gray-800">{auction.year}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Condition</p>
                  <p className="text-2xl font-bold text-green-600 capitalize">
                    {auction.condition}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 font-semibold">Starting Bid</p>
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{auction.startingBid.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Auction Date</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Date(auction.auctionDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-semibold">Current Highest Bid</p>
                  <p className="text-3xl font-black text-orange-600">
                    {currentBid ? `₹${currentBid.bidAmount.toLocaleString()}` : 'No bids yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bid Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-orange-100 sticky top-24">
            <h2 className="text-4xl font-bold text-orange-600 mb-8 text-center">Place Your Bid</h2>

            {isCurrentBidder ? (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 px-8 py-10 rounded-2xl text-center text-2xl font-bold">
                You have the current highest bid!
              </div>
            ) : auction.auction_stopped ? (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-8 py-10 rounded-2xl text-center text-2xl font-bold">
                This auction has been stopped.
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-500 text-red-700 px-6 py-4 rounded-xl mb-6 text-center font-semibold">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-500 text-green-700 px-6 py-4 rounded-xl mb-6 text-center font-semibold">
                    {success}
                  </div>
                )}

                <form onSubmit={handleBidSubmit} className="space-y-8">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      Your Bid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => handleBidAmountChange(e.target.value)}
                      required
                      min="0"
                      step="1000"
                      placeholder={`Minimum: ₹${minBid.toLocaleString()}`}
                      className="w-full px-6 py-5 text-2xl font-bold text-center border-2 border-orange-300 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition"
                    />
                    <p className="text-center mt-3 text-sm text-gray-600">
                      Minimum bid: <span className="font-bold text-orange-600">₹{minBid.toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-2xl font-black py-6 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Placing Bid...' : 'Place Bid Now'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}