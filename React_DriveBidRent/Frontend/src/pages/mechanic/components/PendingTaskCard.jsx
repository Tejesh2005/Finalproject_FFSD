// client/src/pages/mechanic/components/PendingTaskCard.jsx
export default function PendingTaskCard({ vehicle, onAccept, onDecline }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 text-center border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all">
      <img
        src={vehicle.image}
        alt={vehicle.name}
        className="w-full h-48 object-cover rounded-lg border border-gray-300 hover:opacity-80 hover:scale-105 transition"
      />
      <h3 className="text-xl font-bold text-gray-800 mt-3">{vehicle.name}</h3>
      <p className="text-sm text-gray-600"><strong>Owner:</strong> {vehicle.owner}</p>
      <p className="text-sm text-gray-600"><strong>Mileage:</strong> {vehicle.mileage} km</p>
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={() => onAccept(vehicle.id)}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          Accept
        </button>
        <button
          onClick={() => onDecline(vehicle.id)}
          className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
        >
          Decline
        </button>
      </div>
    </div>
  );
}