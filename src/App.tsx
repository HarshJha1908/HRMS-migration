import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LeaveDashboard from './pages/LeaveDashboard';
import LeaveDetails from './pages/LeaveDetails';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LeaveDashboard />} />
        <Route path="/leave-details" element={<LeaveDetails />} />
      </Route>
    </Routes>
  );
}
