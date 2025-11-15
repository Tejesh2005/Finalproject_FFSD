import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="footerbox">
        <div className="footercontainer">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/buyer/purchases">My Purchases</Link></li>
            <li><Link to="/buyer/wishlist">Wishlist</Link></li>
            <li><Link to="/buyer/notifications">Notifications</Link></li>
            <li><Link to="/buyer/about">About Us</Link></li>
          </ul>
        </div>
        <div className="footercontainer">
          <h3>Contact Us</h3>
          <p><strong>Email:</strong> <a href="mailto:jeevanvankadara@gmail.com">jeevanvankadara@gmail.com</a></p>
          <p><strong>Phone:</strong> <a href="tel:9876543210">9876543210</a></p>
          <p><strong>Address:</strong> sb-2, sagar colony, hyderabad</p>
        </div>
        <div className="footercontainer">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#instagram"><img src="/css/photos/instagram.png" alt="Instagram" className="soc-med-img" /></a>
            <a href="#facebook"><img src="/css/photos/facebook.png" alt="Facebook" className="soc-med-img" /></a>
            <a href="#twitter"><img src="/css/photos/X.png" alt="X" className="soc-med-img" /></a>
          </div>
        </div>
      </div>
      <p className="footer-copy">© 2025 DriveBidRent | All rights reserved.</p>
    </footer>
  );
}