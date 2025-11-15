import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getProfile, getNotifications } from '../../../services/buyer.services';
import { useLogout } from '../../../services/auth.services'; // Import the logout hook

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout(); // Use the logout hook

  useEffect(() => {
    fetchUserData();
    fetchNotificationCount();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await getNotifications();
      const unread = response.filter(notification => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // This will call the API and redirect to home
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, redirect to home
      navigate('/', { replace: true });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/buyer/dashboard">DriveBidRent</Link>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/buyer/purchases" 
            className={`nav-link ${isActive('/buyer/purchases') ? 'active' : ''}`}
          >
            My Purchases
          </Link>
          <Link 
            to="/buyer/wishlist" 
            className={`nav-link ${isActive('/buyer/wishlist') ? 'active' : ''}`}
          >
            Wishlist
          </Link>
          <Link 
            to="/buyer/my-bids" 
            className={`nav-link ${isActive('/buyer/my-bids') ? 'active' : ''}`}
          >
            My Bids
          </Link>
          <Link 
            to="/buyer/notifications" 
            className={`nav-link ${isActive('/buyer/notifications') ? 'active' : ''}`}
          >
            Notifications
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </Link>
          <Link 
            to="/buyer/about" 
            className={`nav-link ${isActive('/buyer/about') ? 'active' : ''}`}
          >
            About Us
          </Link>
        </div>
        
        <div className="nav-profile">
          <div className="profile-info">
            <img 
              src={user?.photoPath || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
              alt="Profile" 
              className="profile-image"
            />
            <span className="profile-name">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </span>
          </div>
          <Link to="/buyer/profile" className="profile-link">Profile</Link>
          {/* Changed from Link to button with onClick handler */}
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
}