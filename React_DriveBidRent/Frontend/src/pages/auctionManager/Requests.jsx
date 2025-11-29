// client/src/pages/auctionManager/Requests.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getRequests();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setRequests(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load requests');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <LoadingSpinner message="Loading requests..." />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Vehicle Requests</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Vehicle Requests</h2>
      
      {requests.length > 0 ? (
        requests.map((req) => (
          <div
            key={req._id}
            className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
              <img src={req.vehicleImage} alt={req.vehicleName} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-800">{req.vehicleName}</h3>
              <p className="text-lg font-bold text-orange-600 mt-1">
                Condition: {req.condition.charAt(0).toUpperCase() + req.condition.slice(1)}
              </p>
              <p className="text-gray-600 mt-2">
                Seller: {req.sellerId.firstName} {req.sellerId.lastName}
              </p>
              <p className="text-gray-600">Location: {req.sellerId.city}</p>
            </div>
            
            <div className="flex items-end">
              <Link
                to={`/auction-manager/assign-mechanic/${req._id}`}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
              >
                Assign Mechanic
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No vehicle requests available
        </div>
      )}
    </div>
  );
}