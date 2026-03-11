// import Footer from '../components/Footer';
import LeaveBalance from '../components/LeaveBalance';
import LeaveForm from '../components/LeaveForm';
import MyLeaveDetail from '../components/MyLeaveDetail';
// import type { LeaveDetailsApi } from '../types/apiTypes';
export default function ApplyLeave() {

  
  return (
    <>
      <LeaveBalance />
     <LeaveForm
  onSubmit={(data) => {
    console.log('Submitted leave:', data);
    // next: update table & balance
  }}
/>
      <MyLeaveDetail showLatestOnly={true} />
    </>
  );
}
