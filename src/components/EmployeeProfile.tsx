import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./EmployeeProfile.css";
// import LockedScreen from "./LockedScreen";
import {
  getEmployeeType,
  getEmpProfileByEmpId,
  getEmployeeTeam,
  saveNewEmpProfile,
  updateEmpProfile
} from "../services/apiService";
import type {
  EmployeeTeamApi,
  EmployeeTypeApi,
  SaveNewEmployeeProfileRequest
} from "../types/apiTypes";

type EmployeeTeamOption = {
  teamId: string;
  teamName: string;
};

const isDefaultTeamOption = (team: EmployeeTeamOption) => {
  const id = String(team.teamId || "").trim();
  const name = String(team.teamName || "").trim().toLowerCase();
  return (
    id === "-1" ||
    name.includes("select") ||
    name.includes("default")
  );
};

type PrefillEmployee = Partial<{
  user_Employee_No: string | number;
  user_Id: string;
  user_Fname: string;
  user_Mname: string;
  user_Lname: string;
  empName: string;
  name: string;
  user_Doj: string;
  user_Email_Id: string;
  user_Sex: string;
  user_Mat_Pat_Applicable: boolean;
  emergencyContactNo1: string;
  emergencyContactNo2: string;
  contactName1: string;
  contactName2: string;
  eligibleTypeCode: string;
  assignmentTeamId: string | number;
  teamName: string;
}>;

const extractUserSeqNo = (payload: unknown): number => {
  if (!payload || typeof payload !== "object") return 0;

  const candidate = payload as Record<string, unknown>;
  const keys = [
    "user_Seq_No",
    "user_Seq_No_",
    "userSeqNo",
    "user_seq_no",
    "userSeqNO",
    "seqNo",
    "seq_no",
    "sequenceNo"
  ];

  for (const key of keys) {
    const value = Number(candidate[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }

  for (const value of Object.values(candidate)) {
    if (value && typeof value === "object") {
      const nested = extractUserSeqNo(value);
      if (nested > 0) return nested;
    }
  }

  return 0;
};

const toIsoDateTime = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const slashDate = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = trimmed.match(slashDate);

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    ) {
      return parsed.toISOString();
    }

    return "";
  }

  const isoLikeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoLikeMatch) {
    const year = Number(isoLikeMatch[1]);
    const month = Number(isoLikeMatch[2]);
    const day = Number(isoLikeMatch[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));

    if (
      parsed.getUTCFullYear() === year &&
      parsed.getUTCMonth() === month - 1 &&
      parsed.getUTCDate() === day
    ) {
      return parsed.toISOString();
    }

    return "";
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  ).toISOString();
};

const toDisplayDate = (value: string | undefined) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
};

const splitFullName = (fullName: string) => {
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { firstName: "", middleName: "", lastName: "" };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], middleName: "", lastName: "" };
  }

  if (tokens.length === 2) {
    return { firstName: tokens[0], middleName: "", lastName: tokens[1] };
  }

  return {
    firstName: tokens[0],
    middleName: tokens.slice(1, -1).join(" "),
    lastName: tokens[tokens.length - 1]
  };
};

const CreateEmployeeLeaveProfile: React.FC = () => {
  const location = useLocation();
  const isUpdateMode = location.state?.mode === "update";
  

  const [employeeType, setEmployeeType] = useState<EmployeeTypeApi[]>([]);
  const [selectedEmployeeType, setSelectedEmployeeType] = useState("");
  const [typeError, setTypeError] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState(false);

  const [employeeTeam, setEmployeeTeam] = useState<EmployeeTeamApi[]>([]);
  const [selectedEmployeeTeam, setSelectedemployeeTeam] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  const [isManager, setIsManager] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [userSeqNo, setUserSeqNo] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeNo, setEmployeeNo] = useState("");
  const [userId, setUserId] = useState("");
  const [emailId, setEmailId] = useState("");
  const [gender, setGender] = useState("M");
  const [isMatPatApplicable, setIsMatPatApplicable] = useState(false);
  const [joiningDate, setJoiningDate] = useState("");
  const [clBalance, setClBalance] = useState("0");
  const [slBalance, setSlBalance] = useState("0");
  const [plBalance, setPlBalance] = useState("0");
  const [aslBalance, setAslBalance] = useState("0");
  const [emergencyContactNo1, setEmergencyContactNo1] = useState("");
  const [emergencyContactNo2, setEmergencyContactNo2] = useState("");
  const [contactName1, setContactName1] = useState("");
  const [contactName2, setContactName2] = useState("");
  const [prefillTeamName, setPrefillTeamName] = useState("");
  const teamRequestSeqRef = useRef(0);

  const selectedEmployeeTypeCode = selectedEmployeeType.trim().toUpperCase();
  const selectedEmployeeTypeLabel = employeeType
    .find((item) => item.eligibleTypeCode.trim().toUpperCase() === selectedEmployeeTypeCode)
    ?.eligibleEmpName?.trim()
    .toLowerCase() || "";

  const isAssociateType =
    selectedEmployeeTypeCode === "ACT" || selectedEmployeeTypeLabel.includes("associate");
  const isProbationType =
    selectedEmployeeTypeCode === "PRB" ||
    selectedEmployeeTypeCode === "PBT" ||
    selectedEmployeeTypeLabel.includes("probation");
  const isConfirmedType =
    selectedEmployeeTypeCode === "CFM" ||
    selectedEmployeeTypeCode === "CON" ||
    selectedEmployeeTypeLabel.includes("confirmed");

  const disableClBalance = isAssociateType;
  const disablePlBalance = isAssociateType || isProbationType;
  const disableAslBalance = isProbationType || isConfirmedType;
  const showClBalanceField = !isAssociateType;
  const showSlBalanceField = !isAssociateType;
  const showPlBalanceField = !isAssociateType && !isProbationType;
  const showAslBalanceField =
    isAssociateType || (!isProbationType && !isConfirmedType);
  const employeeFromState = location.state?.employee as PrefillEmployee | undefined;

  useEffect(() => {
    if (!isAssociateType) return;
    setIsManager(false);
  }, [isAssociateType]);

  useEffect(() => {
    const applyPrefill = async () => {
      if (!employeeFromState) return;

      try {
        const employeeNoFromState = String(employeeFromState.user_Employee_No || "").trim();
        const profileByEmpId = employeeNoFromState
          ? await getEmpProfileByEmpId(employeeNoFromState)
          : null;

        const merged = {
          ...employeeFromState,
          ...(profileByEmpId || {})
        } as PrefillEmployee;

        const resolvedUserSeqNo = extractUserSeqNo(profileByEmpId) || extractUserSeqNo(employeeFromState);
        setUserSeqNo(Number.isFinite(resolvedUserSeqNo) ? resolvedUserSeqNo : 0);

        const preferredName = String(
          merged.empName ||
          merged.name ||
          `${merged.user_Fname || ""} ${merged.user_Mname || ""} ${merged.user_Lname || ""}`
        ).trim();

        const nameParts = splitFullName(preferredName);

        setFirstName(nameParts.firstName);
        setMiddleName(nameParts.middleName);
        setLastName(nameParts.lastName);
        setEmployeeNo(String(merged.user_Employee_No || ""));
        setUserId(String(merged.user_Id || ""));
        setEmailId(String(merged.user_Email_Id || ""));
        setGender(String(merged.user_Sex || "M"));
        setIsMatPatApplicable(Boolean(merged.user_Mat_Pat_Applicable));
        setJoiningDate(toDisplayDate(merged.user_Doj));
        setEmergencyContactNo1(String(merged.emergencyContactNo1 || ""));
        setEmergencyContactNo2(String(merged.emergencyContactNo2 || ""));
        setContactName1(String(merged.contactName1 || ""));
        setContactName2(String(merged.contactName2 || ""));
        setSelectedEmployeeType(String(merged.eligibleTypeCode || "").trim().toUpperCase());

        const assignmentTeamId = String(merged.assignmentTeamId || "").trim();
        const teamName = String(merged.teamName || "").trim();

        if (assignmentTeamId) {
          setSelectedemployeeTeam(assignmentTeamId);
          setPrefillTeamName("");
        } else if (teamName) {
          setPrefillTeamName(teamName);
        }
      } catch {
        // Keep form usable for manual update even when prefill fetch fails.
      }
    };

    applyPrefill();
  }, [employeeFromState]);

  useEffect(() => {
    if (!prefillTeamName || employeeTeam.length === 0) return;

    const match = employeeTeam.find((team) =>
      String(team.teamName || "").trim().toLowerCase() === prefillTeamName.toLowerCase()
    );

    if (!match) return;

    setSelectedemployeeTeam(String(match.teamId || "").trim());
    setPrefillTeamName("");
  }, [employeeTeam, prefillTeamName]);

  useEffect(() => {
    const fetchemployeeType = async () => {
      setLoadingType(true);
      setTypeError(null);

      try {
        const response = await getEmployeeType();
        const list = Array.isArray(response) ? response : response?.data;
        const rawList = Array.isArray(list) ? list : [];
        const cleanList = rawList
          .map((item) => ({
            eligibleTypeCode: String(
              item?.eligibleTypeCode ?? item?.EligibleTypeCode ?? ""
            ).trim(),
            eligibleEmpName: String(
              item?.eligibleEmpName ?? item?.EligibleEmpName ?? ""
            ).trim(),
            eligibleTypeId: Number(
              item?.eligibleTypeId ?? item?.EligibleTypeId ?? 0
            ),
            isActive: Boolean(item?.isActive ?? item?.IsActive ?? true)
          }))
          .filter((item) => item.eligibleTypeCode !== "");

        setEmployeeType(cleanList);
      } catch {
        setTypeError("Unable to load employee types.");
      } finally {
        setLoadingType(false);
      }
    };

    fetchemployeeType();
  }, []);

  const fetchEmployeeTeamOptions = async (isManagerValue: boolean) => {
    const requestSeq = ++teamRequestSeqRef.current;
    setLoadingTeam(true);
    setTeamError(null);

    try {
      const response = await getEmployeeTeam(isManagerValue, true);
      const list = Array.isArray(response) ? response : response?.data;
      const rawList = Array.isArray(list) ? list : [];
      const cleanList: EmployeeTeamOption[] = rawList
        .map((item) => {
          const rawTeamId =
            item?.teamId ??
            item?.teamID ??
            item?.assignmentTeamId ??
            item?.id;

          const rawTeamName =
            item?.teamName ??
            item?.assignmentTeamName ??
            item?.name ??
            "";

          return {
            teamId: rawTeamId == null ? "" : String(rawTeamId).trim(),
            teamName: String(rawTeamName || rawTeamId || "")
          };
        })
        .filter((item) => item.teamId.trim() !== "");

      if (requestSeq !== teamRequestSeqRef.current) return;

      setEmployeeTeam(cleanList);
      if (cleanList.length > 0) {
        setSelectedemployeeTeam((prev) => {
          const hasPrevious = cleanList.some((team) => team.teamId === prev);
          if (hasPrevious) return prev;

          const defaultOption = cleanList.find((team) => isDefaultTeamOption(team));
          return defaultOption ? defaultOption.teamId : cleanList[0].teamId;
        });
      } else {
        setSelectedemployeeTeam("");
        setTeamError("Unable to load assignment teams.");
      }
    } catch {
      if (requestSeq !== teamRequestSeqRef.current) return;
      setTeamError("Unable to load assignment teams.");
      setEmployeeTeam([]);
      setSelectedemployeeTeam("");
    } finally {
      if (requestSeq === teamRequestSeqRef.current) {
        setLoadingTeam(false);
      }
    }
  };

  useEffect(() => {
    void fetchEmployeeTeamOptions(false);
  }, []);

  const handleIsManagerChange = (checked: boolean) => {
    setIsManager(checked);
    setEmployeeTeam([]);
    setSelectedemployeeTeam("");
    setTeamError(null);
    void fetchEmployeeTeamOptions(checked);
  };

  const validateForm = () => {
    const isoDoj = toIsoDateTime(joiningDate);
    const empNo = Number(employeeNo);
    const cl = Number(clBalance);
    const sl = Number(slBalance);
    const pl = Number(plBalance);
    const asl = Number(aslBalance);

    if (!selectedEmployeeType.trim()) return "Employee Type is required.";
    if (!firstName.trim()) return "First Name is required.";
    if (!lastName.trim()) return "Last Name is required.";
    if (!employeeNo.trim() || Number.isNaN(empNo)) return "Valid Employee No is required.";
    if (!userId.trim()) return "User Id is required.";
    if (!emailId.trim()) return "Email Id is required.";
    if (!gender.trim()) return "Gender is required.";
    if (!joiningDate.trim() || !isoDoj) return "Joining Date must be valid (dd/mm/yyyy or yyyy-mm-dd).";
    if (!selectedEmployeeTeam.trim() || selectedEmployeeTeam.trim() === "-1") {
      return "Valid Assignment Team is required.";
    }
    if (Number.isNaN(cl) || Number.isNaN(sl) || Number.isNaN(pl) || Number.isNaN(asl)) {
      return "Leave balances must be valid numbers.";
    }

    return null;
  };

  const handleCreate = async () => {
    setSaveError(null);
    setSaveMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    const payload: SaveNewEmployeeProfileRequest = {
      employee: {
        user_Employee_No: Number(employeeNo),
        user_Seq_No: isUpdateMode ? userSeqNo : 0,
        user_Id: userId.trim(),
        user_Fname: firstName.trim(),
        user_Mname: middleName.trim(),
        user_Lname: lastName.trim(),
        user_Doj: toIsoDateTime(joiningDate),
        user_Email_Id: emailId.trim(),
        user_Line_Mng: 0,
        user_Line_Mng_1: 0,
        isActive: true,
        eligibleTypeCode: selectedEmployeeType.trim().toUpperCase(),
        lwd: "",
        user_Sex: gender,
        user_Mat_Pat_Applicable: isMatPatApplicable,
        emergencyContactNo1: emergencyContactNo1.trim(),
        emergencyContactNo2: emergencyContactNo2.trim(),
        contactName2: contactName2.trim(),
        contactName1: contactName1.trim(),
        lastUpdate: new Date().toISOString()
      },
      isManager,
      assignmentTeamId: selectedEmployeeTeam.trim(),
      cl: disableClBalance ? 0 : Number(clBalance),
      pl: disablePlBalance ? 0 : Number(plBalance),
      asl: disableAslBalance ? 0 : Number(aslBalance)
    };

    try {
      setIsSaving(true);
      if (isUpdateMode) {
        await updateEmpProfile(payload);
      }
      else {
        await saveNewEmpProfile(payload);
      }
      setSaveMessage(
        isUpdateMode
          ? "Employee profile updated successfully."
          : "Employee profile saved successfully."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Unable to save employee profile. Please try again.";

      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="create-employee-form">
      <h2 className="page-title">
        {isUpdateMode ? "Update Employee Leave Profile" : "Create Employee Leave Profile"}
      </h2>
      {/* <LockedScreen/> */}
      <div className="employee-form-card">
        <div className="form-grid">
          {/* Row 1 */}
          <div className="form-group checkbox-group">
            <input type="checkbox" checked readOnly />
            <label>Employee Status</label>
          </div>

          <div className="form-group">
            <label>
              Employee Type<span>*</span>
            </label>

            {typeError && <p style={{ color: "red" }}>{typeError}</p>}
            <select
              value={selectedEmployeeType}
              disabled={loadingType}
              onChange={e => setSelectedEmployeeType(e.target.value)}
            >
              {!selectedEmployeeType && <option value="">----Select Employee Type----</option>}
              {employeeType.map((type) => (
                <option
                  key={type.eligibleTypeCode}
                  value={type.eligibleTypeCode}
                >
                  {type.eligibleEmpName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              checked={isManager}
              disabled={isAssociateType}
              onChange={(e) => handleIsManagerChange(e.target.checked)}
            />
            <label>Is Manager / Head / Team Lead</label>

            {/* {loading && <span className="spinner"></span>} */}
          </div>

          {/* Row 2 */}
          <div className="form-group">
            <label>
              First Name<span>*</span>
            </label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Middle Name</label>
            <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
          </div>

          <div className="form-group">
            <label>
              Last Name<span>*</span>
            </label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          {/* Row 3 */}
          <div className="form-group">
            <label>
              Employee No<span>*</span>
            </label>
            <input
              type="text"
              value={employeeNo}
              onChange={(e) => setEmployeeNo(e.target.value)}
              disabled={isUpdateMode}
            />
          </div>

          <div className="form-group">
            <label>
              User Id<span>*</span>
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              disabled={isUpdateMode}
            />
          </div>

          <div className="form-group">
            <label>
              Email Id<span>*</span>
            </label>
            <input
              type="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
              disabled={isUpdateMode}
            />
          </div>

          {/* Row 4 */}
          <div className="form-group">
            <label>
              Gender<span>*</span>
            </label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              checked={isMatPatApplicable}
              onChange={(e) => setIsMatPatApplicable(e.target.checked)}
            />
            <label>Maternity / Paternity Leave Applicable</label>
          </div>

          <div className="form-group">
            <label>
              Joining Date (dd/mm/yyyy)<span>*</span>
            </label>
            <input
              type="text"
              placeholder="dd/mm/yyyy"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
            />
          </div>

          {/* Row 5 */}
          <div className="form-group">
            <label>Emergency Contact Name 1</label>
            <input
              type="text"
              value={contactName1}
              onChange={(e) => setContactName1(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact No 1</label>
            <input
              type="text"
              value={emergencyContactNo1}
              onChange={(e) => setEmergencyContactNo1(e.target.value)}
            />
          </div>

          <div className="form-group contact-spacer" aria-hidden="true" />

          <div className="form-group">
            <label>Emergency Contact Name 2</label>
            <input
              type="text"
              value={contactName2}
              onChange={(e) => setContactName2(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact No 2</label>
            <input
              type="text"
              value={emergencyContactNo2}
              onChange={(e) => setEmergencyContactNo2(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <label>
              Assignment Team<span>*</span>
            </label>
            {loadingTeam && <p>Loading teams...</p>}

            {teamError && <p style={{ color: "red" }}>{teamError}</p>}
            <select
              value={selectedEmployeeTeam}
              disabled={loadingTeam}
              onChange={e => setSelectedemployeeTeam(e.target.value)}
            >
              <option value="">Select Assignment Team</option>
              {employeeTeam.map((type, index) => (
                <option
                  key={`${String(type.teamId)}-${index}`}
                  value={type.teamId}
                >
                  {type.teamName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leave balances */}

        <div className="leave-balance-wrapper">
          <div className="leave-section">
            {showClBalanceField && (
              <div className="leave-row">
                <label>
                  Casual Leave (CL) Balance Entry<span>*</span>
                </label>
                <input
                  type="number"
                  value={clBalance}
                  onChange={(e) => setClBalance(e.target.value)}
                  disabled={disableClBalance}
                />
              </div>
            )}

            {showSlBalanceField && (
              <div className="leave-row">
                <label>
                  Sick Leave (SL) Balance Entry<span>*</span>
                </label>
                <input type="number" value={slBalance} onChange={(e) => setSlBalance(e.target.value)} />
              </div>
            )}

            {showPlBalanceField && (
              <div className="leave-row">
                <label>
                  Privileged Leave (PL) Balance Entry<span>*</span>
                </label>
                <input
                  type="number"
                  value={plBalance}
                  onChange={(e) => setPlBalance(e.target.value)}
                  disabled={disablePlBalance}
                />
              </div>
            )}

            {showAslBalanceField && (
              <div className="leave-row">
                <label>
                  Associate Leave (ASL) Balance Entry<span>*</span>
                </label>
                <input
                  type="number"
                  value={aslBalance}
                  onChange={(e) => setAslBalance(e.target.value)}
                  disabled={disableAslBalance}
                />
              </div>
            )}
          </div>
        </div>

        {saveError && <p style={{ color: "red" }}>{saveError}</p>}
        {saveMessage && <p style={{ color: "green" }}>{saveMessage}</p>}

        <div className="action-bar">
          <button className="btn-primary" onClick={handleCreate} disabled={isSaving}>
            {isSaving ? "Saving..." : isUpdateMode ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CreateEmployeeLeaveProfile;
