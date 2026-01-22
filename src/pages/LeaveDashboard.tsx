import LeaveBalance from '../components/LeaveBalance';
import LeaveForm from '../components/LeaveForm';
import LeaveTable from '../components/LeaveTable';

export default function LeaveDashboard() {
  return (
    <>
      <LeaveBalance />
     <LeaveForm
  onSubmit={(data) => {
    console.log('Submitted leave:', data);
    // next: update table & balance
  }}
/>

      <LeaveTable />
    </>
  );
}
