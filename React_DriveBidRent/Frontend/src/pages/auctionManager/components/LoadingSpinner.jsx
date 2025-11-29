// client/src/pages/auctionManager/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', fullScreen = true, size = 80 }) {
  // fullScreen: occupies full viewport and centers spinner
  // non-fullScreen: occupies a reasonable min-height block and centers spinner within it
  const containerClass = fullScreen
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'w-full min-h-[220px] flex items-center justify-center';

  const spinnerStyle = {
    width: size,
    height: size,
    borderTopWidth: Math.max(3, Math.round(size * 0.06))
  };

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div
          className="animate-spin rounded-full border-orange-600 mx-auto mb-4"
          style={{ ...spinnerStyle, borderStyle: 'solid', borderRightWidth: spinnerStyle.borderTopWidth, borderBottomWidth: spinnerStyle.borderTopWidth, borderLeftWidth: spinnerStyle.borderTopWidth, borderColor: '#e5e7eb', borderTopColor: '#ea580c' }}
        />
        <p className="text-xl md:text-2xl font-bold text-orange-600">{message}</p>
      </div>
    </div>
  );
}
