// client/src/pages/seller/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10 mt-20 border-t-4 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-600 inline-block pb-1">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li><Link to="/seller-dashboard" className="hover:text-orange-400">Dashboard</Link></li>
            <li><Link to="/seller/add-auction" className="hover:text-orange-400">Add Auction</Link></li>
            <li><Link to="/seller/add-rental" className="hover:text-orange-400">Add Rental</Link></li>
            <li><Link to="/seller/view-earnings" className="hover:text-orange-400">Earnings</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-600 inline-block pb-1">
            Contact Us
          </h3>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:jeevanvankadara@gmail.com" className="hover:text-orange-400">
              jeevanvankadara@gmail.com
            </a>
          </p>
          <p><strong>Phone:</strong> <a href="tel:9876543210" className="hover:text-orange-400">9876543210</a></p>
          <p><strong>Address:</strong> sb-2, sagar colony, hyderabad</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-600 inline-block pb-1">
            Follow Us
          </h3>
          <div className="flex space-x-4">
            <a href="#instagram">
              <img src="/css/photos/instagram.png" alt="Instagram" className="w-8 h-8 hover:scale-110 transition" />
            </a>
            <a href="#facebook">
              <img src="/css/photos/facebook.png" alt="Facebook" className="w-8 h-8 hover:scale-110 transition" />
            </a>
            <a href="#twitter">
              <img src="/css/photos/X.png" alt="X" className="w-8 h-8 hover:scale-110 transition" />
            </a>
          </div>
        </div>
      </div>

      <p className="text-center mt-8 text-sm opacity-70">
        © 2025 DriveBidRent | All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;