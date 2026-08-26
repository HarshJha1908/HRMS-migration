import type { CSSProperties } from "react";
import "./Skeletons.css";

type SkeletonProps = {
  className?: string;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr className="skeleton-table-row" key={rowIndex} aria-hidden="true">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex}>
              <Skeleton
                className="skeleton-table-cell"
                width={`${55 + ((rowIndex + columnIndex) % 4) * 10}%`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function ProfileSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div className="skeleton-profile" aria-label="Profile placeholders" role="status">
      {title && (
        <div className="skeleton-panel-title">
          <Skeleton width="190px" height="30px" />
        </div>
      )}
      <div className="skeleton-profile-grid">
        {Array.from({ length: 24 }, (_, index) => (
          <div className={index % 2 === 0 ? "skeleton-label-cell" : ""} key={index}>
            <Skeleton width={index % 2 === 0 ? "68%" : "55%"} height="14px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="skeleton-dashboard" aria-label="Leave dashboard placeholders" role="status">
      <div className="skeleton-panel-title">
        <Skeleton width="220px" height="30px" />
      </div>
      <div className="skeleton-dashboard-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton-dashboard-card" key={index}>
            <Skeleton className="skeleton-circle" width="58px" height="58px" />
            <Skeleton width="70px" height="20px" />
            <Skeleton width="72px" height="62px" />
            <Skeleton width="105px" height="13px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaveBalanceSkeleton() {
  return (
    <div className="skeleton-balance" aria-label="Leave balance placeholders" role="status">
      <div className="skeleton-balance-legend">
        <Skeleton width="280px" height="15px" />
      </div>
      <div className="skeleton-balance-grid">
        {Array.from({ length: 3 }, (_, column) => (
          <div key={column}>
            {Array.from({ length: 3 }, (_, row) => (
              <Skeleton
                className="skeleton-balance-line"
                width={`${72 + ((column + row) % 3) * 8}%`}
                height="16px"
                key={row}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="skeleton-form" aria-label="Form placeholders" role="status">
      {Array.from({ length: fields }, (_, index) => (
        <div className="skeleton-form-field" key={index}>
          <Skeleton width="42%" height="13px" />
          <Skeleton width="100%" height="40px" />
        </div>
      ))}
      <Skeleton className="skeleton-form-button" width="120px" height="40px" />
    </div>
  );
}

export function ListSkeleton({ items = 7 }: { items?: number }) {
  return (
    <div className="skeleton-list" aria-label="List placeholders" role="status">
      {Array.from({ length: items }, (_, index) => (
        <div className="skeleton-list-item" key={index}>
          <Skeleton className="skeleton-circle" width="32px" height="32px" />
          <div>
            <Skeleton width={`${58 + (index % 3) * 12}%`} height="14px" />
            <Skeleton width="38%" height="11px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DocumentPreviewSkeleton() {
  return (
    <div className="skeleton-document" aria-label="Document placeholders" role="status">
      <Skeleton width="44%" height="18px" />
      <Skeleton width="76%" height="12px" />
      <Skeleton width="68%" height="12px" />
      <Skeleton className="skeleton-document-page" width="100%" height="72%" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="skeleton-page" aria-label="Page placeholders" role="status">
      <Skeleton width="240px" height="32px" />
      <FormSkeleton fields={3} />
      <div className="skeleton-page-table">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton width="100%" height="46px" key={index} />
        ))}
      </div>
    </div>
  );
}
