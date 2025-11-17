// client/src/pages/mechanic/components/MechanicNavbar.jsx
import { NavLink } from 'react-router-dom';
import { useLogout } from '../../../services/auth.services';   // <-- fixed import

export default function MechanicNavbar() {
  const logout = useLogout();   // <-- now works

  return (
    <nav className="sticky top-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <NavLink to="/mechanic/dashboard" className="text-2xl font-bold text-orange-600">
              DriveBidRent
            </NavLink>
          </div>

          <div className="hidden md:flex space-x-8">
            <NavLink
              to="/mechanic/current-tasks"
              className={({ isActive }) =>
                `text-gray-700 font-medium hover:text-orange-600 transition ${isActive ? 'border-b-4 border-orange-600' : ''}`
              }
            >
              Current Tasks
            </NavLink>
            <NavLink
              to="/mechanic/past-tasks"
              className={({ isActive }) =>
                `text-gray-700 font-medium hover:text-orange-600 transition ${isActive ? 'border-b-4 border-orange-600' : ''}`
              }
            >
              Past Tasks
            </NavLink>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <NavLink to="/mechanic/profile" className="text-orange-600 font-semibold hover:text-orange-700">
              My Profile
            </NavLink>
            <button
              onClick={logout}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}