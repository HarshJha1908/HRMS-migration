import LeaveBalance from "../components/LeaveBalance";
import ViewLeaveDetails from "../components/ViewLeave";
import { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import type { LeaveDetails } from "../types/apiTypes";

const normalizeAdId = (value: unknown) => String(value ?? "").trim();

const pickAdIdFromLeaveDetails = (details: LeaveDetails | null) => {
  if (!details) return "";

  const candidate = details as LeaveDetails & {
    userId?: unknown;
    adId?: unknown;
    requesterAdId?: unknown;
    requesterUserId?: unknown;
    user_Id?: unknown;
  };

  return (
    normalizeAdId(candidate.requesterAdId) ||
    normalizeAdId(candidate.requesterUserId) ||
    normalizeAdId(candidate.userId) ||
    normalizeAdId(candidate.adId) ||
    normalizeAdId(candidate.user_Id)
  );
};

export default function EmployeeLeaveDetails() {
  const location = useLocation();
  const { adId: adIdFromRouteParam } = useParams<{ adId?: string }>();
  const [resolvedUserId, setResolvedUserId] = useState("");
  const [leaveBalanceRefreshKey, setLeaveBalanceRefreshKey] = useState(0);

  const userIdFromRouteState = useMemo(() => {
    const routeState = (location.state ?? {}) as {
      userId?: unknown;
      adId?: unknown;
      requesterAdId?: unknown;
      requesterUserId?: unknown;
      user_Id?: unknown;
    };

    return (
      normalizeAdId(routeState.userId) ||
      normalizeAdId(routeState.adId) ||
      normalizeAdId(routeState.requesterAdId) ||
      normalizeAdId(routeState.requesterUserId) ||
      normalizeAdId(routeState.user_Id)
    );
  }, [location.state]);

  const userIdFromPath = normalizeAdId(adIdFromRouteParam);
  const leaveBalanceUserId = userIdFromPath || userIdFromRouteState || resolvedUserId || undefined;

  return (
    <>
      <LeaveBalance
        userId={leaveBalanceUserId}
        refreshKey={leaveBalanceRefreshKey}
      />
      <ViewLeaveDetails
        onDataLoaded={(details) => {
          const extractedUserId = pickAdIdFromLeaveDetails(details);
          if (extractedUserId) {
            setResolvedUserId(extractedUserId);
          }
        }}
        onLeaveStatusChanged={() => {
          setLeaveBalanceRefreshKey((prev) => prev + 1);
        }}
      />
    </>
  );
}
