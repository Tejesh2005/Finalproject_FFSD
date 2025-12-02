// client/src/pages/auctionManager/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-lg font-semibold mb-2">DriveBidRent - Auction Manager</p>
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} DriveBidRent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}