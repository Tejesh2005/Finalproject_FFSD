// client/src/pages/mechanic/pending-tasks/PendingTasks.jsx
import { useEffect, useState } from 'react';
import { getPendingTasks, acceptPendingTask, declinePendingTask } from '../../../services/mechanic.services';
import { Link } from 'react-router-dom';

export default function PendingTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingTasks()
      .then(res => setTasks(res.data.data.tasks || []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (id) => {
    await acceptPendingTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  const handleDecline = async (id) => {
    await declinePendingTask(id);
    setTasks(tasks.filter(t => t._id !== id));
  };

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">Pending Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">No pending tasks.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(t => {
            const v = t.vehicle;
            return (
              <div key={t._id} className="bg-white rounded-lg shadow-md p-5 text-center border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all">
                <Link to={`/mechanic/car-details/${v._id}`}>
                  <img
                    src={v.vehicleImage}
                    alt={v.vehicleName}
                    className="w-full h-48 object-cover rounded-lg border border-gray-300 hover:opacity-80 hover:scale-105 transition"
                  />
                </Link>
                <h3 className="text-xl font-bold text-gray-800 mt-3">{v.vehicleName}</h3>
                <p className="text-sm text-gray-600"><strong>Owner:</strong> {t.owner}</p>
                <p className="text-sm text-gray-600"><strong>Mileage:</strong> {v.mileage.toLocaleString()} km</p>
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={() => handleAccept(t._id)}
                    className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(t._id)}
                    className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}