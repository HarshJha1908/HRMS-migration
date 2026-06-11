import "./ToastMessage.css";

type ToastMessageProps = {
  message: string;
  show: boolean;
  type?: "success" | "error";
};

export default function ToastMessage({
  message,
  show,
  type = "success",
}: ToastMessageProps) {
  if (!show) return null;

  return (
    <div className={`toast-message ${type}`}>
      {message}
    </div>
  );
}