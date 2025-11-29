// client/src/pages/auctionManager/PendingCarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';

export default function PendingCarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getPendingCarDetails(id);
        const data = res.data || res;

        if (data.success) {
          setCar(data.data);
          setStatus(data.data.status || 'pending');
        } else {
          setError(data.message || 'Failed to load details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === 'approved' && (!car.mechanicReview?.mechanicalCondition || !car.mechanicReview?.bodyCondition)) {
      alert('Cannot approve without complete mechanic review');
      return;
    }
    if (!confirm(`Confirm: ${newStatus.toUpperCase()} this vehicle?`)) return;

    try {
      const res = await auctionManagerServices.updateStatus(id, newStatus);
      if (res.data.success) {
        setStatus(newStatus);
        alert(`Vehicle ${newStatus} successfully!`);
          if (newStatus === 'approved') {
            // redirect to Approved Cars page after approval
            navigate('/auction-manager/approved');
          }
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-orange-600">Loading Vehicle Details...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pt-20">
        <div className="max-w-4xl mx-auto text-center py-16 bg-white rounded-3xl shadow-xl">
          <p className="text-3xl font-bold text-red-600">Error</p>
          <p className="text-xl text-gray-700 mt-4">{error || 'Vehicle not found'}</p>
        </div>
      </div>
    );
  }

  const hasFullReview = car.mechanicReview?.mechanicalCondition && car.mechanicReview?.bodyCondition;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-8 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero Image with Title & Status */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-12">
          <img
            src={car.vehicleImage || '/images/placeholder-car.jpg'}
            alt={car.vehicleName}
            className="w-full h-96 md:h-[520px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 drop-shadow-2xl">
              {car.vehicleName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-lg">
              <span>{car.year} • {car.mileage.toLocaleString()} km • {car.fuelType}</span>
              <span className={`px-6 py-2 rounded-full font-bold text-lg ${
                status === 'approved' ? 'bg-green-600' :
                status === 'rejected' ? 'bg-red-600' :
                'bg-amber-600'
              }`}>
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Card - Clean spacing, no overlap */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

          {/* Vehicle Specifications */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Vehicle Specifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Year', value: car.year },
              { label: 'Mileage', value: `${car.mileage.toLocaleString()} km` },
              { label: 'Condition', value: car.condition, highlight: true },
              { label: 'Fuel Type', value: car.fuelType },
              { label: 'Transmission', value: car.transmission },
              { label: 'Starting Bid', value: `₹${car.startingBid.toLocaleString()}`, highlight: true },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl text-center ${item.highlight ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}
              >
                <p className="text-gray-600 font-medium">{item.label}</p>
                <p className={`text-xl font-bold mt-1 ${item.highlight ? 'text-orange-700' : 'text-gray-800'}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Assigned Mechanic */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-10">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Assigned Mechanic</h3>
            <p className="text-lg">
              <span className="font-semibold">Name:</span>{' '}
              {car.assignedMechanic?.firstName} {car.assignedMechanic?.lastName || 'Not assigned yet'}
            </p>
            {car.mechanicReview?.submittedAt && (
              <p className="text-lg mt-2">
                <span className="font-semibold">Report Submitted:</span>{' '}
                {new Date(car.mechanicReview.submittedAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            )}
          </div>

          {/* Mechanic Inspection Report - Only Amber Border */}
          <div className="rounded-3xl p-8 border-2 border-amber-300">
            <h3 className="text-3xl font-bold text-amber-800 text-center mb-8">
              Mechanic Inspection Report
            </h3>

            {hasFullReview ? (
              <div className="space-y-8">
                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Mechanical Condition</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.mechanicalCondition}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Body & Exterior Condition</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.bodyCondition}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-lg mb-2 text-gray-800">Recommendations / Notes</p>
                  <div className="p-5 rounded-xl border-2 border-amber-300 bg-white">
                    {car.mechanicReview.recommendations || 'No additional notes'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-2xl font-bold text-red-600">Review Pending</p>
                <p className="text-gray-700 mt-3">Waiting for mechanic to submit inspection report</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => updateStatus('approved')}
              disabled={!hasFullReview}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                hasFullReview
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              Approve for Auction
            </button>

            <button
              onClick={() => updateStatus('rejected')}
              className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
            >
              Reject Vehicle
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}