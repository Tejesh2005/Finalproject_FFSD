// client/src/pages/auctionManager/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authServices } from '../../../services/auth.services';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      // Call logout API to clear JWT cookie
      await authServices.logout();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/');
    }
  };

  const isActive = (path) => currentPath.includes(path);

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/auction-manager/dashboard" 
            className="text-2xl font-bold text-orange-600"
          >
            DriveBidRent
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/auction-manager/dashboard" 
              className={`font-medium transition ${
                isActive('/dashboard') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/auction-manager/requests" 
              className={`font-medium transition ${
                isActive('/requests') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Requests
            </Link>
            <Link 
              to="/auction-manager/pending" 
              className={`font-medium transition ${
                isActive('/pending') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Pending Cars
            </Link>
            <Link 
              to="/auction-manager/approved" 
              className={`font-medium transition ${
                isActive('/approved') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Approved Cars
            </Link>
            <Link 
              to="/auction-manager/chats" 
              className={`font-medium transition ${
                isActive('/chats') 
                  ? 'text-orange-600' 
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Chats
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/auction-manager/profile"
              className="text-orange-600 font-medium hover:text-orange-700 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}