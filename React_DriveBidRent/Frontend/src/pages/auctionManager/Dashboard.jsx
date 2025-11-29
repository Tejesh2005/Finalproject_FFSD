// client/src/pages/auctionManager/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function Dashboard() {
  const [data, setData] = useState({ pending: [], assigned: [], approved: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await auctionManagerServices.getDashboard();
        const responseData = res.data || res;

        if (responseData.success) {
          setData(responseData.data || { pending: [], assigned: [], approved: [] });
        } else {
          setError(responseData.message || 'Failed to load dashboard');
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading Dashboard..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center max-w-md border border-red-200">
          <p className="text-2xl font-bold text-gray-800 mb-3">Connection Error</p>
          <p className="text-red-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-4 space-y-20">

        {/* ==================== REQUESTS ==================== */}
        <section>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-orange-600 mb-12">
            Requests
          </h2>

          {data.pending.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <p className="text-2xl font-semibold text-gray-700">All caught up!</p>
              <p className="text-gray-500 mt-2">No pending vehicle requests at the moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.pending.map((req) => (
                  <div
                    key={req._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-2 border-orange-300 overflow-hidden flex flex-col h-full"
                  >
                    <div className="relative">
                      <img
                        src={req.vehicleImage || '/images/placeholder.jpg'}
                        alt={req.vehicleName}
                        className="w-full h-56 object-cover"
                      />
                      <span className="absolute top-4 left-4 bg-orange-600 text-white font-bold px-5 py-2 rounded-full text-sm shadow-lg">
                        PENDING
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{req.vehicleName}</h3>
                      <div className="space-y-3 text-gray-700 flex-grow">
                        <p className="text-sm">
                          <span className="font-semibold">Seller:</span> {req.sellerId?.firstName} {req.sellerId?.lastName}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Location:</span> {req.sellerId?.city || 'Not specified'}
                        </p>
                      </div>

                      <Link
                        to={`/auction-manager/assign-mechanic/${req._id}`}
                        className="mt-6 w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-xl transition transform hover:scale-105 shadow-md"
                      >
                        Assign Mechanic
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/auction-manager/requests" className="text-orange-600 font-bold text-xl hover:text-orange-700 underline">
                  View All Requests →
                </Link>
              </div>
            </>
          )}
        </section>

        {/* ==================== PENDING INSPECTIONS ==================== */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-amber-700 mb-12">
            Pending Inspections
          </h2>

          {data.assigned.length === 0 ? (
            <p className="text-center text-xl text-gray-600 py-10">No vehicles awaiting inspection report</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.assigned.map((car) => {
                const hasReview = !!(car.mechanicReview && (car.mechanicReview.mechanicalCondition || car.mechanicReview.bodyCondition));
                return (
                  <div
                    key={car._id}
                    className={`bg-white rounded-2xl ${hasReview ? 'shadow-md' : 'shadow-lg hover:shadow-2xl'} transition-all duration-300 transform hover:-translate-y-3 ${hasReview ? 'border-2 border-green-300' : 'border-2 border-amber-300'} overflow-hidden flex flex-col h-full`}
                  >
                    <div className="relative">
                      <img
                        src={car.vehicleImage}
                        alt={car.vehicleName}
                        className="w-full h-56 object-cover"
                      />
                      <span className={`absolute top-4 left-4 text-white font-bold px-5 py-2 rounded-full text-sm shadow-lg ${hasReview ? 'bg-green-600' : 'bg-amber-600'}`}>
                        {hasReview ? 'Inspection Done' : 'Awaiting Report'}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{car.vehicleName}</h3>
                      <div className="space-y-3 text-gray-700 flex-grow">
                        <p className="text-sm">
                          <span className="font-semibold">Seller:</span> {car.sellerId?.firstName} {car.sellerId?.lastName}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Location:</span> {car.sellerId?.city || 'Not specified'}
                        </p>
                        {hasReview && (
                          <div className="mt-3 p-3 bg-green-50 rounded-md text-sm text-green-800">
                            <strong className="block">Mechanic's Summary:</strong>
                            <div className="truncate">{car.mechanicReview?.mechanicalCondition || car.mechanicReview?.bodyCondition || 'Review submitted'}</div>
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/auction-manager/pending-car-details/${car._id}`}
                        className={`${hasReview ? 'mt-6 w-full text-center bg-green-600 hover:bg-green-700' : 'mt-6 w-full text-center bg-amber-600 hover:bg-amber-700'} text-white font-bold py-3.5 rounded-xl transition transform hover:scale-105 shadow-md`}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== LIVE AUCTIONS ==================== */}
        <section>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center text-green-600 mb-12">
            Live Auctions
          </h2>

          {data.approved.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <p className="text-2xl font-semibold text-gray-700">No active auctions</p>
              <p className="text-gray-500 mt-2">Approved vehicles will appear here when auctions go live</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.approved.map((car) => (
                  <div
                    key={car._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 border-2 border-green-300"
                  >
                    <div className="relative">
                      <img
                        src={car.vehicleImage}
                        alt={car.vehicleName}
                        className="w-full h-60 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <span className="absolute bottom-4 left-4 bg-green-600 text-white font-bold px-6 py-2 rounded-r-full shadow-lg">
                        LIVE
                      </span>
                    </div>

                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{car.vehicleName}</h3>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-gray-600 text-sm">Year</p>
                          <p className="text-xl font-bold text-gray-800">{car.year}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <p className="text-gray-600 text-sm">Mileage</p>
                          <p className="text-xl font-bold text-gray-800">{car.mileage.toLocaleString()} km</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center col-span-2">
                          <p className="text-gray-600 text-sm">Starting Bid</p>
                          <p className="text-2xl font-bold text-green-600">₹{car.startingBid.toLocaleString()}</p>
                        </div>
                      </div>

                      <Link
                        to={`/auction-manager/view-bids/${car._id}`}
                        className="w-full block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
                      >
                        View Live Bids
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/auction-manager/approved" className="text-green-600 font-bold text-xl hover:text-green-700 underline">
                  See All Live Auctions →
                </Link>
              </div>
            </>
          )}
        </section>

      </div>
    </div>
  );
}