import type { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './MainLayout.css';

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      <main className="main-layout">
        {children}
      </main>
    </>
  );
}
