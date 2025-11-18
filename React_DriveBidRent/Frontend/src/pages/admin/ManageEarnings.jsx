import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";

const ManageEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await adminServices.getManageEarnings();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load earnings");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center text-red-700 mt-8">{error}</div>;

  return (
    <>
      <section className="py-8 max-w-6xl mx-auto px-6">
        <h1 className="text-center text-3xl font-bold text-orange-600 mb-8">Manage Earnings</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-orange-600">Total Revenue</h3>
            <p className="text-2xl font-bold mt-2">₹{data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-orange-600">Revenue from Auctions</h3>
            <p className="text-2xl font-bold mt-2">₹{data.totalAuctionRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-orange-600">Revenue from Rentals</h3>
            <p className="text-2xl font-bold mt-2">₹{data.totalRentalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-orange-600 text-lg font-semibold mb-4">Previous Transactions</h2>
          {data.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-orange-600 text-white">
                    <th className="p-3 text-left">UTR Number</th>
                    <th className="p-3 text-left">User Name</th>
                    <th className="p-3 text-left">Type of Revenue</th>
                    <th className="p-3 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((transaction, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3">{transaction.utrNumber || 'N/A'}</td>
                      <td className="p-3">{transaction.userName}</td>
                      <td className="p-3">{transaction.type}</td>
                      <td className="p-3">₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No transactions available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ManageEarnings;
