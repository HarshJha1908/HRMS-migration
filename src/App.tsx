import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LeaveDetails from './pages/LeaveDetails';
import CreateEmployeeLeaveProfile from './components/EmployeeProfile';
import PendingApproval from './admin/PendingApproval';
import HolidayList from './components/HolidayList';
import EmployeeLeaveDetails from './pages/ViewEmployeeLeave';
import ApplyLeave from './pages/ApplyLeave';
import { getLoginUser } from './services/apiService';
import { useEffect } from 'react';
import Insurance from './components/Insurance';
// import { getLoginUser } from './services/apiService';
// import { useEffect } from 'react';

export default function App() {

  useEffect(() => {

  const loadUser = async () => {

    const user = await getLoginUser();

    sessionStorage.setItem("username", user.username);

    console.log("Logged in user:", user.username);

  };

  loadUser();

}, []);
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ApplyLeave />} />
        <Route path="/apply-leave" element={<ApplyLeave />} />
        <Route path="/leave-details" element={<LeaveDetails />} />
        <Route path="/profile" element={<CreateEmployeeLeaveProfile />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/holiday-list" element={<HolidayList />} />
        <Route path="/leave-view" element={<EmployeeLeaveDetails />} />
        <Route path="/insurance" element={<Insurance />} />
      </Route>
    </Routes>
  );
}
