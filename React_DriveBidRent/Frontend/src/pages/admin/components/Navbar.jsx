import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../../redux/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      try { localStorage.removeItem('user'); } catch (e) {}
      navigate('/', { replace: true });
    }
  };

  return (
    <nav style={{ position: "sticky", top: 0, background: "#fff", padding: "1rem 0", boxShadow: "0 2px 20px rgba(255,107,0,0.2)", zIndex: 1000 }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 2rem" }}>
        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#ff6b00" }}>
          <Link to="/admin/dashboard">DriveBidRent</Link>
        </div>
        <div style={{ display: "flex", gap: "2rem" }}>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/manage-users">Manage Users</Link>
          <Link to="/admin/manage-earnings">Manage Earnings</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Profile" style={{ width: 40, height: 40, borderRadius: "50%" }} />
          <Link to="/admin/admin-profile" style={{ color: "#ff6b00", fontWeight: 600, textTransform: "uppercase" }}>MY PROFILE</Link>
          <button onClick={handleLogout} style={{ background: "#ff6b00", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 4, cursor: "pointer" }}>
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;