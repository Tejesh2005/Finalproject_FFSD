import { Routes, Route } from 'react-router-dom';

// Public
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// === ADMIN ===
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import Analytics from './pages/admin/Analytics';
import ManageEarnings from './pages/admin/ManageEarnings';
import AdminProfile from './pages/admin/AdminProfile';

// Buyer
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerProfile from './pages/buyer/Profile';
import RentalDetails from './pages/buyer/RentalDetails';
import BookRental from './pages/buyer/BookRental';
import MyBids from './pages/buyer/MyBids';  

// Seller
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/Dashboard';
import SellerProfile from './pages/seller/Profile';
import Wishlist from './pages/buyer/Wishlist';
import AddRental from './pages/seller/AddRental';
import AuctionDetailsSeller from './pages/seller/AuctionDetails';

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* === ADMIN SPA === */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="manage-users" element={<ManageUsers />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="manage-earnings" element={<ManageEarnings />} />
                <Route path="admin-profile" element={<AdminProfile />} />
            </Route>

            <Route path="/buyer" element={<BuyerLayout />}>
                <Route index element={<BuyerDashboard />} />
                <Route path="dashboard" element={<BuyerDashboard />} />
                <Route path="profile" element={<BuyerProfile />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="rentals/:id" element={<RentalDetails />} />
                <Route path="rentals/:id/book" element={<BookRental />} />
                <Route path="my-bids" element={<MyBids />} />
            </Route>

            <Route path="/seller" element={<SellerLayout />}>
                <Route path="view-bids/:id" element={<ViewBids />} />
                <Route index element={<SellerDashboard />} />
                <Route path="dashboard" element={<SellerDashboard />} />
            </Route>

            <Route
                path="*"
                element={
                    <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-gray-700">
                        404 - Page Not Found
                    </div>
                }
            />
        </Routes>
    );
}

export default App;