import "./PageLoader.css";

type PageLoaderProps = {
  show?: boolean;
};

export default function PageLoader({
  show = true
}: PageLoaderProps) {
  if (!show) return null;

  return (
    <div className="page-loader-overlay">
      <div className="page-loader-spinner"></div>
    </div>
  );
}