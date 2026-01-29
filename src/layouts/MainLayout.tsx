// import type { ReactNode } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import './MainLayout.css';
import { Outlet } from 'react-router-dom';

// type Props = {
//   children: ReactNode;
// };

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="main-layout">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
