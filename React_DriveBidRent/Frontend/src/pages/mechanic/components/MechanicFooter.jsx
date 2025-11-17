// client/src/pages/mechanic/components/MechanicFooter.jsx
export default function MechanicFooter() {
  return (
    <footer className="bg-gray-800 text-white py-10 border-t-4 border-orange-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="text-xl font-bold border-b-4 border-orange-600 inline-block pb-1 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-orange-600 transition">My Purchases</a></li>
              <li><a href="#" className="hover:text-orange-600 transition">Wishlist</a></li>
              <li><a href="#" className="hover:text-orange-600 transition">Notifications</a></li>
              <li><a href="#" className="hover:text-orange-600 transition">About Us</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold border-b-4 border-orange-600 inline-block pb-1 mb-4">Contact Us</h3>
            <p><strong>Email:</strong> <a href="mailto:jeevanvankadara@gmail.com" className="hover:text-orange-600">jeevanvankadara@gmail.com</a></p>
            <p><strong>Phone:</strong> <a href="tel:9876543210" className="hover:text-orange-600">9876543210</a></p>
            <p><strong>Address:</strong> SB-2, Sagar Colony, Hyderabad</p>
          </div>

          <div>
            <h3 className="text-xl font-bold border-b-4 border-orange-600 inline-block pb-1 mb-4">Follow Us</h3>
            <div className="flex space-x-4 mt-3">
              <a href="#"><img src="/css/photos/instagram.png" alt="Instagram" className="w-8 h-8 hover:scale-125 transition filter brightness-0 invert" /></a>
              <a href="#"><img src="/css/photos/facebook.png" alt="Facebook" className="w-8 h-8 hover:scale-125 transition filter brightness-0 invert" /></a>
              <a href="#"><img src="/css/photos/X.png" alt="X" className="w-8 h-8 hover:scale-125 transition filter brightness-0 invert" /></a>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 border-t border-orange-600 pt-4 text-sm opacity-90">
          <p>© 2025 DriveBidRent | All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}