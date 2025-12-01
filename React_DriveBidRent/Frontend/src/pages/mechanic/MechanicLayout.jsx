// client/src/pages/mechanic/MechanicLayout.jsx
import { Outlet } from 'react-router-dom';
import MechanicNavbar from './components/MechanicNavbar';
import MechanicFooter from './components/MechanicFooter';

export default function MechanicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <MechanicNavbar />
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>
      <MechanicFooter />
    </div>
  );
}