// client/src/pages/mechanic/past-tasks/PastTasks.jsx
import { useEffect, useState } from 'react';
import { getPastTasks } from '../../../services/mechanic.services';
import PastTaskCard from '../components/PastTaskCard';

export default function PastTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPastTasks()
      .then(res => setTasks(res.data.data.completedTasks || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-orange-600 text-center mb-8">Past Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tasks.length > 0 ? (
          tasks.map(v => <PastTaskCard key={v._id} vehicle={v} />)
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg">No past tasks available.</p>
        )}
      </div>
    </div>
  );
}