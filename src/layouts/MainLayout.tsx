import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import './MainLayout.css';
 
type Props = {
  children: ReactNode;
};
 
export default function MainLayout({ children }: Props) {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-layout">
        {children}
      </main>
      <Footer />
    </div>
  );
}