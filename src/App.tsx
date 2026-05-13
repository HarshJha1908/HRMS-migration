import { lazy, Suspense } from "react";
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthGate from "./auth/AuthGate";
import { UserProvider } from "./context/UserContext";
// import { getLoginUser } from './services/apiService';
// import { getLoginUser } from './services/apiService';
// import { useEffect } from 'react';

const HomePage = lazy(() => import("./pages/HomePage"));
const JobVacancy = lazy(() => import("./pages/JobVacancy"));
const LeaveBalance = lazy(() => import("./components/LeaveBalance"));
const LockedScreen = lazy(() => import("./components/LockedScreen"));
const ApplyLeave = lazy(() => import("./pages/ApplyLeave"));
const LeaveDetails = lazy(() => import("./pages/LeaveDetails"));
const LeaveRules = lazy(() => import("./pages/LeaveRules"));
const CreateEmployeeLeaveProfile = lazy(() => import("./components/EmployeeProfile"));
const PendingApproval = lazy(() => import("./admin/PendingApproval"));
const TeamLeaveDetails = lazy(() => import("./pages/TeamLeaveDetails"));
const HolidayList = lazy(() => import("./components/HolidayList"));
const EmployeeLeaveDetails = lazy(() => import("./pages/ViewEmployeeLeave"));
const Insurance = lazy(() => import("./components/Insurance"));
const DownLoadCenter = lazy(() => import("./components/DownLoadCenter"));
const QuickExport = lazy(() => import("./components/QuickExport"));
const SingleSearch = lazy(() => import("./components/SingleSearch"));
const SingleSearchDetails = lazy(() => import("./pages/SingleSearchDetails"));
const SingleSearchCreateException = lazy(() => import("./pages/SingleSearchCreateException"));
const ExitLeaveAdjustment = lazy(() => import("./pages/ExitLeaveAdjustment"));
const MyProfile = lazy(() => import("./components/Myprofile"));
const ViewDocuments = lazy(() => import("./pages/ViewDocuments"));

const SpecialLeaveEntry = lazy(() => import("./pages/SpecialLeaveEntry"));

export default function App() {

//   useEffect(() => {

//   const loadUser = async () => {

//     const user = await getLoginUser();

//     sessionStorage.setItem("username", user.username);


//   };

//   loadUser();

// }, []);
  return (
    <Suspense fallback={<div style={{ padding: "12px" }}>Loading...</div>}>
      <AuthGate>
        <UserProvider>
        <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apply-leave" element={<ApplyLeave />} />
          <Route path="/leave-details" element={<LeaveDetails />} />
          <Route path="/leave-balance" element={<LeaveBalance/>} />
          <Route path="/leave-rules" element={<LeaveRules />} />
          <Route path="/profile" element={<CreateEmployeeLeaveProfile />} />
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/team-leave-details" element={<TeamLeaveDetails />} />
          <Route path="/holiday-list" element={<HolidayList />} />
          <Route path="/leave-view" element={<EmployeeLeaveDetails />} />
          <Route path="/insurance" element={<Insurance />} />
          <Route path="*" element={<h1>404 - Not Found</h1>} />
          <Route path="/download-center" element={<DownLoadCenter />} />
          <Route path="/quick-export" element={<QuickExport />} />
          <Route path="/single-search" element={<SingleSearch />} />
          <Route path="/single-search/details" element={<SingleSearchDetails />} />
          <Route path="/single-search/create-exception" element={<SingleSearchCreateException />} />
          <Route path="/single-search/exit-leave-adjustment" element={<ExitLeaveAdjustment />} />
          <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/job-vacancy" element={<JobVacancy />} />
        <Route path="/special-leave-entry" element={<SpecialLeaveEntry />} />
        <Route path="/documents/:documentType" element={<ViewDocuments />} />
        <Route path="/documents" element={<ViewDocuments />} />
        <Route path="/locked" element={<LockedScreen />} />
        </Route>
        </Routes>
        </UserProvider>
      </AuthGate>
    </Suspense>
  );
}
