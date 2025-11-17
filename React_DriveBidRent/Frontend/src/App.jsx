import { Routes, Route } from 'react-router-dom';

// Public
import HomePage from './pages/auth/HomePage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Buyer
import BuyerLayout from './pages/buyer/BuyerLayout';
import BuyerDashboard from './pages/buyer/Dashboard';
import BuyerProfile from './pages/buyer/Profile';   

// Seller
import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/Dashboard';
import SellerProfile from './pages/seller/Profile';  

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/buyer" element={<BuyerLayout />}>
                <Route index element={<BuyerDashboard />} />
                <Route path="dashboard" element={<BuyerDashboard />} />
                <Route path="profile" element={<BuyerProfile />} />
            </Route>

            <Route path="/seller" element={<SellerLayout />}>
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