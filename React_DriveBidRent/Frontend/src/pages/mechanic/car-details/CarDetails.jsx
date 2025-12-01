// client/src/pages/mechanic/car-details/CarDetails.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVehicleDetails, submitReview } from '../../../services/mechanic.services';

export default function CarDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ mechanicalCondition: '', bodyCondition: '', recommendations: '', conditionRating: '' });

  useEffect(() => {
    getVehicleDetails(id).then(res => setData(res.data.data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitReview(id, form);
    alert('Review submitted!');
    window.location.href = '/mechanic/dashboard';
  };

  if (!data) return <div className="text-center py-20 text-xl">Loading...</div>;

  const { vehicle, seller } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img src={vehicle.vehicleImage} alt={vehicle.vehicleName} className="w-full h-80 object-cover rounded-lg" />
          <h1 className="text-3xl font-bold text-orange-600 mt-4">{vehicle.vehicleName}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Vehicle Specifications</h2>
            {['year', 'mileage', 'condition', 'fuelType', 'transmission', 'auctionDate'].map(field => (
              <div key={field} className="flex justify-between py-2 border-b">
                <span className="font-semibold capitalize">{field.replace(/([A-Z])/g, ' $1')}:</span>
                <span>
                  {field === 'mileage' ? vehicle[field].toLocaleString() + ' km' :
                   field === 'auctionDate' ? new Date(vehicle[field]).toLocaleDateString() :
                   field === 'condition' || field === 'fuelType' || field === 'transmission' ? 
                   vehicle[field].charAt(0).toUpperCase() + vehicle[field].slice(1) :
                   vehicle[field]}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-orange-600 mb-4">Seller Information</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {seller.firstName} {seller.lastName}</p>
              <p><strong>Contact:</strong> {seller.phone}</p>
              <p><strong>Address:</strong> {seller.doorNo}, {seller.street}, {seller.city}, {seller.state}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-orange-600 mb-4">Mechanic's Review</h2>
          {vehicle.reviewStatus === 'completed' ? (
            <div className="bg-green-100 p-4 rounded text-green-800">
              <p className="font-bold">Review already submitted.</p>
              <div className="mt-3 space-y-2">
                {Object.entries(vehicle.mechanicReview).map(([k, v]) => (
                  <p key={k}><strong>{k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> {v}</p>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                name="conditionRating" required
                className="w-full p-3 border rounded"
                onChange={e => setForm({ ...form, conditionRating: e.target.value })}
              >
                <option value="">Select Rating</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
              <textarea placeholder="Mechanical Condition" required className="w-full p-3 border rounded h-24"
                onChange={e => setForm({ ...form, mechanicalCondition: e.target.value })} />
              <textarea placeholder="Body & Interior Condition" required className="w-full p-3 border rounded h-24"
                onChange={e => setForm({ ...form, bodyCondition: e.target.value })} />
              <textarea placeholder="Recommendations" className="w-full p-3 border rounded h-24"
                onChange={e => setForm({ ...form, recommendations: e.target.value })} />
              <button type="submit" className="bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 w-full font-bold">
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}