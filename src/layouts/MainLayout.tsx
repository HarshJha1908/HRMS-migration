// import type { ReactNode } from 'react';
import Navbar1 from '../components/Navbar 1';
import './MainLayout.css';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';

// type Props = {
//   children: ReactNode;
// };

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar1 />
      <main className="main-layout">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
