// client/src/pages/auctionManager/AuctionManagerLayout.jsx
import { Outlet } from 'react-router-dom';
import { Component } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function AuctionManagerLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 bg-gray-50">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}