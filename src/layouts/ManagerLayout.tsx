// import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './ManagerLayout.css';
import { Outlet } from 'react-router-dom';
import Footer from '../components/footer';


export default function ManagerLayout() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-layout">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
