// client/src/pages/auctionManager/PendingCars.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function PendingCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPending();
        const responseData = res.data || res;
        
        if (responseData.success) {
          setCars(responseData.data || []);
        } else {
          setError(responseData.message || 'Failed to load pending cars');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load pending cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) return <LoadingSpinner message="Loading pending cars..." />;

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-montserrat">
      <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Pending Cars</h2>
      
      {cars.length > 0 ? (
        cars.map((car) => (
          <div
            key={car._id}
            className="flex bg-white rounded-xl mb-6 p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition transform hover:-translate-y-1"
          >
            <div className="w-80 h-48 overflow-hidden rounded-lg mr-8">
              <img src={car.vehicleImage} alt={car.vehicleName} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-gray-800">{car.vehicleName}</h3>
              <p className="text-lg font-bold text-orange-600 mt-1">
                Condition: {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
              </p>
              <p className="text-gray-600 mt-2">
                Seller: {car.sellerId.firstName} {car.sellerId.lastName}
              </p>
              <p className="text-gray-600">Location: {car.sellerId.city}</p>
            </div>
            
            <div className="flex items-end">
              <Link
                to={`/auction-manager/pending-car-details/${car._id}`}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
              >
                View Details
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16 text-gray-600 text-lg">
          No pending cars available
        </div>
      )}
    </div>
  );
}