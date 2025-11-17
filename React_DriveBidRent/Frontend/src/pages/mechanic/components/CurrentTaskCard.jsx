// client/src/pages/mechanic/components/CurrentTaskCard.jsx
import { Link } from 'react-router-dom';

export default function CurrentTaskCard({ vehicle }) {
  return (
    <Link
      to={`/mechanic/car-details/${vehicle._id}`}
      className="bg-white rounded-lg shadow-md p-5 text-center border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-96 flex flex-col justify-between"
    >
      <img
        src={vehicle.vehicleImage}
        alt={vehicle.vehicleName}
        className="w-full h-48 object-cover rounded-lg border border-gray-300"
      />
      <div>
        <h3 className="text-xl font-bold text-gray-800 mt-3 truncate">{vehicle.vehicleName}</h3>
        <p className="text-sm text-gray-600"><strong>Year:</strong> {vehicle.year}</p>
        <p className="text-sm text-gray-600"><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km</p>
        <p className="text-sm text-gray-600"><strong>Condition:</strong> {vehicle.condition.charAt(0).toUpperCase() + vehicle.condition.slice(1)}</p>
        <p className="text-sm text-gray-600"><strong>Auction Date:</strong> {new Date(vehicle.auctionDate).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}