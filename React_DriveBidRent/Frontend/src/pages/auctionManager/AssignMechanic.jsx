// client/src/pages/auctionManager/AssignMechanic.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auctionManagerServices } from '../../services/auctionManager.services';
import LoadingSpinner from './components/LoadingSpinner';

export default function AssignMechanic() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [mechanics, setMechanics] = useState([]);
  const [selected, setSelected] = useState('');
  const [assigned, setAssigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await auctionManagerServices.getAssignMechanic(id);
        const responseData = res.data || res;
        
        if (responseData.success) {
          setRequest(responseData.data.request);
          setMechanics(responseData.data.mechanics || []);
        } else {
          setError(responseData.message || 'Failed to load data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async () => {
    if (!selected) {
      alert('Please select a mechanic');
      return;
    }
    
    const mechanic = mechanics.find(m => m._id === selected);
    if (!mechanic) {
      alert('Invalid mechanic selected');
      return;
    }

    try {
      setAssigning(true);
      const res = await auctionManagerServices.assignMechanic(id, {
        mechanicId: selected,
        mechanicName: `${mechanic.firstName} ${mechanic.lastName}`
      });
      
      const responseData = res.data || res;
      
      if (responseData.success) {
        setAssigned(true);
      } else {
        alert(responseData.message || 'Failed to assign mechanic');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign mechanic');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading vehicle details..." />;

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Assign Mechanic</h2>
        <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-orange-600 mb-8">Assign Mechanic</h2>
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center">
          Vehicle request not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 font-montserrat">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg mb-6 bg-gray-100">
            <img
              src={request.vehicleImage}
              alt={request.vehicleName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x400?text=Vehicle+Image';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800">{request.vehicleName}</h1>
        </div>

        <div className="lg:w-1/2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-600 pb-2">Vehicle Information</h2>
            <div className="space-y-3 mt-4 text-lg">
              <p><strong>Fuel Type:</strong> {request.fuelType || 'Not specified'}</p>
              <p><strong>Mileage:</strong> {request.mileage ? `${request.mileage} km` : 'Not specified'}</p>
              <p><strong>Condition:</strong> {request.condition || 'Pending'}</p>
              <p><strong>Year:</strong> {request.year || 'Not specified'}</p>
              <p><strong>Transmission:</strong> {request.transmission || 'Not specified'}</p>
              <p><strong>Starting Bid:</strong> {request.startingBid ? `₹${request.startingBid}` : 'Not specified'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-orange-600 pb-2">Seller Details</h2>
            {request.sellerId ? (
              <div className="space-y-2 mt-4 text-lg">
                <p><strong>Name:</strong> {request.sellerId.firstName} {request.sellerId.lastName}</p>
                <p><strong>Contact:</strong> {request.sellerId.phone || 'Not provided'}</p>
                <p><strong>Location:</strong> {[
                  request.sellerId.doorNo,
                  request.sellerId.street,
                  request.sellerId.city,
                  request.sellerId.state
                ].filter(Boolean).join(', ')}</p>
              </div>
            ) : (
              <p className="mt-4">Seller information not available</p>
            )}
          </div>

          <div className="mt-8">
            {assigned ? (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-bold text-lg">
                Mechanic Assigned Successfully!
              </div>
            ) : (
              <>
                <button
                  onClick={() => document.getElementById('mechanic-select').style.display = 'block'}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition"
                >
                  Assign Mechanic
                </button>
                <select
                  id="mechanic-select"
                  className="hidden w-full mt-4 p-3 border border-gray-300 rounded-lg text-lg"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Select a Mechanic</option>
                  {mechanics.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.firstName} {m.lastName} {m.shopName && `- ${m.shopName}`} {m.experienceYears && `(${m.experienceYears} yrs exp)`}
                    </option>
                  ))}
                </select>
                {selected && (
                  <button
                    onClick={handleAssign}
                    disabled={assigning}
                    className="mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold w-full hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </button>
                )}
                
                {mechanics.length === 0 && (
                  <div className="mt-4 bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center">
                    No mechanics available. Please add mechanics first.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}