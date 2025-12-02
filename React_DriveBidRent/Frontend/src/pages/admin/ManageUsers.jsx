import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminServices from '../../services/admin.services';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const ManageUsers = () => {
  const [data, setData] = useState({
    pendingMechanics: [],
    approvedMechanics: [],
    buyers: [],
    sellers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerms, setSearchTerms] = useState({
    pendingMechanic: '',
    approvedMechanic: '',
    buyer: '',
    seller: ''
  });
  const [showAll, setShowAll] = useState({
    pendingMechanics: false,
    approvedMechanics: false,
    buyers: false,
    sellers: false
  });
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminServices.getManageUsers();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError('Failed to load users');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [navigate]);

  const handleSearch = (type, value) => {
    setSearchTerms(prev => ({ ...prev, [type]: value.toLowerCase() }));
  };

  const toggleShowMore = (type) => {
    setShowAll(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const showAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 5000);
  };

  const handleAction = async (action, id, type) => {
    try {
      let res;
      if (action === 'approve') {
        res = await adminServices.approveMechanic(id);
      } else if (action === 'decline') {
        res = await adminServices.declineUser(id);
      } else if (action === 'deleteBuyer') {
        res = await adminServices.deleteBuyer(id);
      } else if (action === 'deleteSeller') {
        res = await adminServices.deleteSeller(id);
      }

      if (res.success) {
        showAlert(res.message);
        // Refresh data
        const refreshed = await adminServices.getManageUsers();
        if (refreshed.success) setData(refreshed.data);
      } else {
        showAlert(res.message, 'danger');
      }
    } catch (err) {
      showAlert('Error performing action', 'danger');
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const filterUsers = (users, searchTerm) => {
    return users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email.toLowerCase();
      return fullName.includes(searchTerm) || email.includes(searchTerm);
    });
  };

  const renderUserList = (users, type, isMechanic = false, isPending = false) => {
    const searchTerm = searchTerms[type];
    const filtered = filterUsers(users, searchTerm);
    const display = showAll[type] ? filtered : filtered.slice(0, 5);

    return (
      <>
        <div className="search-bar mb-4">
          <input
            type="text"
            placeholder={`Search ${type}s...`}
            className="w-full p-2.5 border border-gray-300 rounded font-medium text-base"
            onChange={(e) => handleSearch(type, e.target.value)}
          />
        </div>
        <ul className={`${type}-list list-none p-0`}>
          {display.length > 0 ? (
            display.map(user => (
              <li key={user._id} className={`${type}-item p-4 border-b border-gray-200 flex justify-between items-center transition-all duration-500 ease-in-out`} data-firstname={user.firstName.toLowerCase()} data-lastname={user.lastName.toLowerCase()} data-email={user.email.toLowerCase()}>
                <div className={`${type}-info flex-grow`}>
                  {user.firstName} {user.lastName} ({user.email})
                </div>
                <div className="action-buttons flex gap-2.5">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold transition"
                    onClick={() => openModal(user)}
                  >
                    View Details
                  </button>
                  {isMechanic && isPending && (
                    <button
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-semibold transition"
                      onClick={() => handleAction('approve', user._id, type)}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold transition"
                    onClick={() => handleAction(isPending ? 'decline' : type === 'buyer' ? 'deleteBuyer' : 'deleteSeller', user._id, type)}
                  >
                    {isPending ? 'Decline' : 'Delete'}
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className={`no-${type}s p-8 text-center text-gray-600 italic`}>No {type}s found</li>
          )}
        </ul>
        {filtered.length > 5 && (
            <div className="show-more flex justify-center mt-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded flex items-center gap-1 transition" onClick={() => toggleShowMore(type)}>
              {showAll[type] ? 'Show Less' : 'Show More'} <span className="arrow">{showAll[type] ? '▲' : '▼'}</span>
            </button>
          </div>
        )}
      </>
    );
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message text-center text-red-700 mt-8">{error}</div>;

  return (
    <>
      <div id="alertContainer" className="fixed top-5 right-5 z-[1001]">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert alert-${alert.type} p-4 mb-5 border border-transparent rounded opacity-100 transition-opacity duration-500 ease-in-out`}>
            <span onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="float-right text-xl font-bold leading-none cursor-pointer" style={{ color: 'inherit' }}>×</span>
            {alert.message}
          </div>
        ))}
      </div>
      <div className="container p-8 max-w-6xl mx-auto">
        <h1 className="text-center text-4xl font-bold text-orange-500 mb-8">Manage Users</h1>

        <div className="card bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Pending Mechanics</h2>
          {renderUserList(data.pendingMechanics, 'pendingMechanic', true, true)}
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Approved Mechanics</h2>
          {renderUserList(data.approvedMechanics, 'approvedMechanic', true, false)}
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Buyers</h2>
          {renderUserList(data.buyers, 'buyer')}
        </div>

        <div className="card bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-orange-500 mb-6">Sellers</h2>
          {renderUserList(data.sellers, 'seller')}
        </div>
      </div>

      {selectedUser && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
          <div className="modal-content relative bg-white m-auto p-8 w-full max-w-4xl rounded-lg shadow-2xl">
            <span className="close absolute top-4 right-6 text-2xl cursor-pointer text-gray-500 hover:text-gray-700" onClick={closeModal}>&times;</span>
            <h2 className="text-xl font-bold text-gray-800 mb-6">User Details</h2>
            <div className="details-grid grid grid-cols-2 gap-4 text-gray-700">
              <p><strong>First Name:</strong> {selectedUser.firstName}</p>
              <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>User Type:</strong> {selectedUser.userType}</p>
              {selectedUser.userType === 'mechanic' && (
                <>
                  <p><strong>Approved Status:</strong> {selectedUser.approved_status}</p>
                  <p><strong>Shop Name:</strong> {selectedUser.shopName}</p>
                  <p><strong>Experience Years:</strong> {selectedUser.experienceYears}</p>
                  <p><strong>Repair Bikes:</strong> {selectedUser.repairBikes ? 'Yes' : 'No'}</p>
                  <p><strong>Repair Cars:</strong> {selectedUser.repairCars ? 'Yes' : 'No'}</p>
                </>
              )}
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Address:</strong> {selectedUser.doorNo}, {selectedUser.street}, {selectedUser.city}, {selectedUser.state}</p>
              {selectedUser.googleAddressLink && <p><strong>Google Address:</strong> <a href={selectedUser.googleAddressLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View on Google Maps</a></p>}
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ManageUsers;