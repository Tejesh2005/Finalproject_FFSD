// Temporary test component
export default function DashboardTest() {
  console.log('TEST DASHBOARD RENDERING');
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-orange-600 mb-4">
        Auction Manager Dashboard - TEST
      </h1>
      <p className="text-gray-700">
        If you can see this, the routing and layout are working correctly.
      </p>
      <div className="mt-4 bg-blue-100 p-4 rounded">
        <p className="font-bold">Current URL: {window.location.href}</p>
        <p>Current Path: {window.location.pathname}</p>
      </div>
    </div>
  );
}
