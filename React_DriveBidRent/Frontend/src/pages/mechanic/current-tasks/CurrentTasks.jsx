// client/src/pages/mechanic/current-tasks/CurrentTasks.jsx
import { useEffect, useState } from 'react';
import { getCurrentTasks } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';

export default function CurrentTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentTasks()
      .then(res => setTasks(res.data.data.assignedVehicles || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">Current Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tasks.length > 0 ? (
          tasks.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg">No current tasks.</p>
        )}
      </div>
    </div>
  );
}