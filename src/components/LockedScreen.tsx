import "./LockedScreen.css";

type LockedScreenProps = {
  message?: string;
};

export default function LockedScreen({
  message = "This page is under development"
}: LockedScreenProps) {
  return (
    <div className="locked-overlay">
      <div className="locked-box">
        <div className="lock-icon">🔒</div>
        <h2>Locked Page</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}