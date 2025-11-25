// client/src/pages/mechanic/dashboard/Dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboard } from '../../../services/mechanic.services';
import CurrentTaskCard from '../components/CurrentTaskCard';
import PastTaskCard from '../components/PastTaskCard';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => setData({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">Loading...</div>;
  if (!data) return <div className="text-center py-20 text-red-600">Error loading dashboard</div>;

  const { showApprovalPopup, displayedVehicles = [], completedTasks = [] } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {showApprovalPopup && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-6 rounded-lg mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Approval Pending</h2>
          <p>Process underway. Please wait for admin approval to access the Mechanic Dashboard.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Back to Login
          </button>
        </div>
      )}

      <section className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">Current Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedVehicles.length > 0 ? (
            displayedVehicles.map(v => <CurrentTaskCard key={v._id} vehicle={v} />)
          ) : (
            <p className="col-span-full text-center text-gray-600">No vehicles currently assigned to you.</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/mechanic/current-tasks"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
          >
            See More
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">Past Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {completedTasks.length > 0 ? (
            completedTasks.map(v => <PastTaskCard key={v._id} vehicle={v} />)
          ) : (
            <p className="col-span-full text-center text-gray-600">No past tasks available.</p>
          )}
        </div>
        <div className="text-center mt-6">
          <Link
            to="/mechanic/past-tasks"
            className="inline-block bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
          >
            See More
          </Link>
        </div>
      </section>
    </div>
  );
}