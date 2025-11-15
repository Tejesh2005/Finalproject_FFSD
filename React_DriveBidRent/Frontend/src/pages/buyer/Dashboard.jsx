import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CarCard from './components/CarCard';
import { getDashboardData, getWishlist, addToWishlist, removeFromWishlist } from '../../services/buyer.services';

export default function Dashboard() {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [featuredRentals, setFeaturedRentals] = useState([]);
  const [wishlist, setWishlist] = useState({ auctions: [], rentals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchWishlist();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await getDashboardData();
      setFeaturedAuctions(data.featuredAuctions || []);
      setFeaturedRentals(data.featuredRentals || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (id, type) => {
    try {
      const isInWishlist = wishlist[type === 'auction' ? 'auctions' : 'rentals']?.some(item => item._id === id);
      
      if (isInWishlist) {
        await removeFromWishlist(id, type);
      } else {
        await addToWishlist(id, type);
      }
      
      // Refresh wishlist
      fetchWishlist();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="heading1">
        <h1><strong className="oneL">D</strong>rive<strong className="oneL">B</strong>id<strong className="oneL">R</strong>ent</h1> 
        <p>Buy or Rent—Drive Your Dream with <strong className="oneL">Ease!</strong></p>
      </div>

      {/* Featured Auctions Section */}
      <section className="auctions">
        <h2>Featured Auctions</h2>
        <div className="card-container">
          {featuredAuctions.length > 0 ? (
            featuredAuctions.map(auction => (
              <CarCard 
                key={auction._id} 
                item={auction} 
                type="auction"
                isInWishlist={wishlist.auctions?.some(item => item._id === auction._id)}
                onToggleWishlist={() => toggleWishlist(auction._id, 'auction')}
              />
            ))
          ) : (
            <div className="no-items">
              <p>No auctions available at the moment.</p>
            </div>
          )}
        </div>
        <div className="more-btn-container">
          <Link to="/buyer/auctions" className="more-btn">View All Auctions</Link>
        </div>
      </section>

      {/* Featured Rentals Section */}
      <section className="rentals">
        <h2>Featured Rentals</h2>
        <div className="card-container">
          {featuredRentals.length > 0 ? (
            featuredRentals.map(rental => (
              <CarCard 
                key={rental._id} 
                item={rental} 
                type="rental"
                isInWishlist={wishlist.rentals?.some(item => item._id === rental._id)}
                onToggleWishlist={() => toggleWishlist(rental._id, 'rental')}
              />
            ))
          ) : (
            <div className="no-items">
              <p>No featured rentals available at the moment.</p>
            </div>
          )}
        </div>
        <div className="more-btn-container">
          <Link to="/buyer/rentals" className="more-btn">View All Rentals</Link>
        </div>
      </section>
    </div>
  );
}