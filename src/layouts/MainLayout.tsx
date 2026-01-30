// import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './MainLayout.css';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';

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
      <Footer/>
    </>
  );
}
