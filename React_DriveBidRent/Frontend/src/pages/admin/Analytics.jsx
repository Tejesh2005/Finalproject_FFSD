import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminServices.getAnalytics();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load analytics");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ textAlign: "center", color: "#c62828", marginTop: "2rem" }}>{error}</div>;

  return (
    <>
      <section className="py-8 max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold text-orange-600 mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-orange-600">Total Users</h2>
            <p className="text-2xl font-bold mt-2">{data.totalUsers.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-orange-600">Total Cars Rented</h2>
            <p className="text-2xl font-bold mt-2">{data.totalCarsRented.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-orange-600">Auction Listings</h2>
            <p className="text-2xl font-bold mt-2">{data.totalAuctionListings.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-orange-600 text-lg font-semibold mb-4">Vehicle Sales Performance</h2>
          {data.vehiclePerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left border-b">Car</th>
                    <th className="p-3 text-left border-b">Starting Price</th>
                    <th className="p-3 text-left border-b">Final Sale Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehiclePerformance.map((perf, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-b">{perf.vehicleName || 'Unknown'}</td>
                      <td className="p-3 border-b">{perf.startingPrice != null ? `₹${perf.startingPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</td>
                      <td className="p-3 border-b">{perf.finalSalePrice != null ? `₹${perf.finalSalePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No vehicle sales data available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Analytics;