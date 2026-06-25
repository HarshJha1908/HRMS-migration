import { useEffect, useRef, useState } from "react";
import "./SummaryReport.css";
import type {
    EmployeeContactApi,
    ManagerLeaveBalanceExcelApi,
    ManagerLeaveDetailsExcelApi
} from "../types/apiTypes";
import {
    getEmergencyContactSummaryReport,
    getLeaveBalanceSummaryReport,
    getLeaveDetailsSummaryReport,
    getSummaryReportTeamHeadName,
    getSummaryReportTeamMemberName,
    getSummaryReportTeamName,
    type EmergencyContactSummaryReportApi,
    type LeaveDetailsSummaryReportApi,
    type SummaryReportTeamHeadApi,
    type SummaryReportTeamMemberApi,
    type SummaryReportTeamNameApi
} from "../services/apiService";
import { CsvExportUtil } from "../utils/CsvExportUtil";
import { formatLeaveValue } from "../utils/Utils";
import { useAuth } from "../auth/useAuth";

const SummaryReport = () => {
    const { user } = useAuth();

    const [reportType, setReportType] = useState("");
    const [teamHeads, setTeamHeads] = useState<
        SummaryReportTeamHeadApi[]
    >([]);

    const [selectedTeamHead, setSelectedTeamHead] =
        useState("");
    const [teamNames, setTeamNames] = useState<
        SummaryReportTeamNameApi[]
    >([]);

    const [selectedTeamName, setSelectedTeamName] =
        useState("");
    const [teamMembers, setTeamMembers] = useState<
        SummaryReportTeamMemberApi[]
    >([]);

    const [selectedTeamMember, setSelectedTeamMember] =
        useState("");

    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const messageRef = useRef<HTMLDivElement | null>(null);

    const [leaveBalanceData, setLeaveBalanceData] =
        useState<ManagerLeaveBalanceExcelApi[]>([]);

    const [leaveDetailsData, setLeaveDetailsData] =
        useState<LeaveDetailsSummaryReportApi[]>([]);

    const [emergencyContactData, setEmergencyContactData] =
        useState<EmergencyContactSummaryReportApi[]>([]);

    const [startDate, setStartDate] =
        useState("");

    const [endDate, setEndDate] =
        useState("");

    const currentUserId = String(user?.loginUserAdID || "").trim();

    const getStatusClass = (status: string) => {
        const normalized = String(status || "").trim().toLowerCase();

        if (normalized === "p" || normalized === "pending") return "Pending";
        if (normalized === "a" || normalized === "approved") return "Approved";
        if (normalized === "c" || normalized === "cancelled") return "Cancelled";
        if (normalized === "r" || normalized === "rejected") return "Rejected";

        return "Drafted";
    };

    const getLeaveTypeDisplay = (item: LeaveDetailsSummaryReportApi) => {
        const leaveType = String(item.leaveTypeName || item.leaveType || "").trim();

        return leaveType || "NA";
    };

    const getEmergencyContactValue = (
        item: EmergencyContactSummaryReportApi,
        ...keys: Array<keyof EmergencyContactSummaryReportApi>
    ) => {
        for (const key of keys) {
            const value = item[key];
            const text = String(value ?? "").trim();

            if (text) return text;
        }

        return "";
    };

    const mapEmergencyContactsForExport = (
        data: EmergencyContactSummaryReportApi[]
    ): EmployeeContactApi[] =>
        data.map((item) => ({
            empId: Number(getEmergencyContactValue(item, "empId", "employeeId")) || 0,
            empName: getEmergencyContactValue(item, "empName", "employeeName"),
            contactName: getEmergencyContactValue(
                item,
                "contactName",
                "contactNoName1",
                "contactName1"
            ),
            contactNoName1: getEmergencyContactValue(
                item,
                "contactNoName1",
                "contactName1",
                "contactName"
            ),
            contactNo1: getEmergencyContactValue(item, "contactNo1", "contactNumber1"),
            contactNoName2: getEmergencyContactValue(item, "contactNoName2", "contactName2"),
            contactNo2: getEmergencyContactValue(item, "contactNo2", "contactNumber2"),
            teamName: getEmergencyContactValue(item, "teamName"),
            managerName: getEmergencyContactValue(item, "managerName"),
            headName: getEmergencyContactValue(item, "headName")
        }));

    const mapLeaveDetailsForExport = (
        data: LeaveDetailsSummaryReportApi[]
    ): ManagerLeaveDetailsExcelApi[] =>
        data.map((item) => ({
            requesterName: item.requesterName,
            employeeId: item.employeeId,
            startDate: item.startDate,
            endDate: item.endDate,
            submitionDate: item.submitionDate,
            dateofapproved: item.dateofapproved,
            leaveType: getLeaveTypeDisplay(item),
            status: getStatusClass(item.statusCode),
            approverName: item.approverName,
            teamName: item.teamName,
            noOfDays: item.noOfDays
        }));

    const downloadCsv = (csv: string, fileName: string) => {
        const blob = new Blob([`\uFEFF${csv}`], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    const clearReportResult = () => {
        setShowResult(false);
        setMessage("");
        setLeaveBalanceData([]);
        setLeaveDetailsData([]);
        setEmergencyContactData([]);
    };

    useEffect(() => {
        if (currentUserId) {
            void loadTeamHead(currentUserId);
        } else {
            setMessage("User ID is missing.");
        }
    }, [currentUserId]);

    useEffect(() => {
        if (message && messageRef.current) {
            messageRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [message]);

    const loadTeamHead = async (userId: string) => {
        try {
            const data =
                await getSummaryReportTeamHeadName(
                    userId
                    
                    
                );
            console.log("Team Head API Response", data);
            setTeamHeads(data);

            if (data.length > 0) {
                const teamHeadId = data[0].teamId;

                setSelectedTeamHead(
                    String(teamHeadId)
                );

                await loadTeamNames(
                    userId,
                    
                    teamHeadId
                );
            }
        } catch (error) {
            console.error(error);
        }
    };
    const loadTeamNames = async (
        userId: string,
        teamHeadId: number
    ) => {
        try {
            const data =
                await getSummaryReportTeamName(
                    userId,
                    teamHeadId
                );

            setTeamNames(data);

            setSelectedTeamName("");
            setTeamMembers([]);
            setSelectedTeamMember("");
        } catch (error) {
            console.error(error);
        }
    };
    const loadTeamMembers = async (
        teamId: number | string
    ) => {
        console.log("Loading members for team:", teamId);
        try {
            const data =
                await getSummaryReportTeamMemberName(
                    teamId
                );
            const members = data.filter((item) => {
                const name = String(item.name || "").trim().toLowerCase();
                const employeeNo = String(item.user_Employee_No || "").trim();

                return name !== "all member" &&
                    name !== "all members" &&
                    employeeNo !== "-1";
            });

            console.log("Members API Response:", members);
            setTeamMembers(members);

            setSelectedTeamMember("");
        } catch (error) {
            console.error(
                "Failed to load team members",
                error
            );
            setTeamMembers([]);
            setSelectedTeamMember("");
        }
    };

    const handleFind = async () => {
        try {
            setLoading(true);
            setMessage("");
            setShowResult(false);
            setLeaveBalanceData([]);
            setLeaveDetailsData([]);
            setEmergencyContactData([]);

            if (!reportType) {
                setMessage("Please select Report type.");
                return;
            }

            if (!selectedTeamName) {
                setMessage("Please select Team Name.");
                return;
            }

            if (!selectedTeamMember) {
                setMessage("Please select Team Member Name.");
                return;
            }

            if (reportType === "Leave Balance") {
                const data =
                    await getLeaveBalanceSummaryReport(
                        selectedTeamHead,
                        selectedTeamName,
                        selectedTeamMember || -1
                    );

                setLeaveBalanceData(data);
                setShowResult(true);

                if (data.length === 0) {
                    setMessage("No leave balance data found.");
                }

                return;
            }

            if (reportType === "Leave Details") {
                if (!startDate || !endDate) {
                    setMessage("Please select date range.");
                    return;
                }

                const data =
                    await getLeaveDetailsSummaryReport(
                        selectedTeamHead,
                        selectedTeamName,
                        selectedTeamMember || -1,
                        startDate,
                        endDate
                    );

                setLeaveDetailsData(data);
                setShowResult(true);

                if (data.length === 0) {
                    setMessage("No leave details data found.");
                }
            }

            if (reportType === "Emergency Contact") {
                const data =
                    await getEmergencyContactSummaryReport(
                        selectedTeamHead,
                        selectedTeamName,
                        selectedTeamMember || -1
                    );

                setEmergencyContactData(data);
                setShowResult(true);

                if (data.length === 0) {
                    setMessage("No emergency contact data found.");
                }
            }
        } catch (error) {
            console.error(error);
            setShowResult(false);
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to load summary report."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            setMessage("");

            if (!reportType) {
                setMessage("Please select report type.");
                return;
            }

            if (!selectedTeamName) {
                setMessage("Please select Team Name.");
                return;
            }

            if (!selectedTeamMember) {
                setMessage("Please select Team Member Name.");
                return;
            }

            if (reportType === "Leave Balance") {
                const data =
                    leaveBalanceData.length > 0
                        ? leaveBalanceData
                        : await getLeaveBalanceSummaryReport(
                            selectedTeamHead,
                            selectedTeamName,
                            selectedTeamMember || -1
                        );

                if (data.length === 0) {
                    setMessage("No leave balance data found.");
                    return;
                }

                setLeaveBalanceData(data);
                setShowResult(true);
                downloadCsv(
                    CsvExportUtil.generateManagerLeaveBalanceCsv(data),
                    "summary-leave-balance-report.csv"
                );
                return;
            }

            if (reportType === "Leave Details") {
                if (!startDate || !endDate) {
                    setMessage("Please select date range.");
                    return;
                }

                const data =
                    leaveDetailsData.length > 0
                        ? leaveDetailsData
                        : await getLeaveDetailsSummaryReport(
                            selectedTeamHead,
                            selectedTeamName,
                            selectedTeamMember || -1,
                            startDate,
                            endDate
                        );

                if (data.length === 0) {
                    setMessage("No leave details data found.");
                    return;
                }

                setLeaveDetailsData(data);
                setShowResult(true);
                downloadCsv(
                    CsvExportUtil.generateManagerLeaveDetailsCsv(
                        mapLeaveDetailsForExport(data)
                    ),
                    `summary-leave-details-${startDate}-to-${endDate}.csv`
                );
                return;
            }

            if (reportType === "Emergency Contact") {
                const data =
                    emergencyContactData.length > 0
                        ? emergencyContactData
                        : await getEmergencyContactSummaryReport(
                            selectedTeamHead,
                            selectedTeamName,
                            selectedTeamMember || -1
                        );

                if (data.length === 0) {
                    setMessage("No emergency contact data found.");
                    return;
                }

                setEmergencyContactData(data);
                setShowResult(true);
                downloadCsv(
                    CsvExportUtil.generateEmergencyContactCsv(
                        mapEmergencyContactsForExport(data)
                    ),
                    "summary-emergency-contact-report.csv"
                );
            }
        } catch (error) {
            console.error(error);
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to export summary report."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="summary-report-page">
            <h1 className="summary-report-title">
                Summary Report
            </h1>

            <div className="summary-report-panel">
                {message && (
                    <div ref={messageRef} className="form-error-text">
                        {message}
                    </div>
                )}

                <div className="summary-report-filter">

                    {/* Team Head */}
                    <div className="summary-report-row">
                        <label className="summary-report-label">
                            Team Head Name
                        </label>

                        <select
                            value={selectedTeamHead}
                            disabled
                            className="summary-report-select"
                        >
                            {teamHeads.map((item) => (
                                <option
                                    key={item.teamId}
                                    value={item.teamId}
                                >
                                    {item.teamName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Name */}
                    <div className="summary-report-row">
                        <label className="summary-report-label">
                            Team Name
                        </label>

                        <select
                            value={selectedTeamName}
                            onChange={(e) => {
                                const teamId = e.target.value;

                                setSelectedTeamName(teamId);
                                setTeamMembers([]);
                                setSelectedTeamMember("");
                                clearReportResult();

                                if (teamId) {
                                    loadTeamMembers(teamId);
                                }
                            }}
                            className="summary-report-select"
                        >
                            <option value="">
                                Select Team Name
                            </option>

                            {teamNames.map((item) => (
                                <option
                                    key={item.teamId}
                                    value={item.teamId}
                                >
                                    {item.teamName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Member */}
                    <div className="summary-report-row">
                        <label className="summary-report-label">
                            Team Member Name
                        </label>

                        <select
                            value={selectedTeamMember}
                            onChange={(e) => {
                                const employeeNo = e.target.value;

                                setSelectedTeamMember(employeeNo);
                                clearReportResult();
                            }}
                            className="summary-report-select"
                        >
                            <option value="">
                                Select Team Member Name
                            </option>

                            <option value="-1">
                                All Member
                            </option>

                            {teamMembers.map((item, index) => (
                                <option
                                    key={`${item.user_Id}-${index}`}
                                    value={item.user_Employee_No}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Report Type */}
                    <div className="summary-report-row">
                        <label className="summary-report-label">
                            Report Type
                        </label>

                        <select
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value);
                                clearReportResult();
                            }}
                            className="summary-report-select"
                        >
                            <option value="">
                                Select Report Type
                            </option>

                            <option value="Leave Balance">
                                Leave Balance
                            </option>

                            <option value="Leave Details">
                                Leave Details
                            </option>

                            <option value="Emergency Contact">
                                Emergency Contact
                            </option>
                        </select>
                    </div>
                    {reportType === "Leave Details" && (
                        <>
                            <div className="summary-report-row">
                                <label className="summary-report-label">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        clearReportResult();
                                    }}
                                />
                            </div>

                            <div className="summary-report-row">
                                <label className="summary-report-label">
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        clearReportResult();
                                    }}
                                />
                            </div>
                        </>
                    )}
                    {/* Button */}
                    <div className="summary-report-button-row">
                        <button
                            type="button"
                            className="summary-report-find-btn"
                            onClick={handleFind}
                            disabled={loading}
                        >
                            {loading ? "Finding..." : "Find"}
                        </button>

                        <button
                            type="button"
                            className="summary-report-export-btn"
                            onClick={handleExport}
                            disabled={loading}
                        >
                            Export
                        </button>
                    </div>
                </div>

                <div className="summary-report-note">
                    * Indicates Employee Resigned
                </div>

                {/* Result Grid Placeholder */}
                <div className="summary-report-result-area">
                    {showResult &&
                        reportType === "Leave Balance" &&
                        leaveBalanceData.length > 0 && (
                        <>
                            <div className="summary-report-balance-note">
                                Leave Balance= Total[Availed or Submitted/Balance]
                            </div>

                            <table className="summary-report-table">
                                <thead>
                                    <tr>
                                        <th>Emp ID</th>
                                        <th>Employee Name</th>
                                        <th>BDL</th>
                                        <th>PL</th>
                                        <th>WFH</th>
                                        <th>WFHX</th>
                                        <th>SL</th>
                                        <th>PTL</th>
                                        <th>CL</th>
                                        <th>ASL</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaveBalanceData.map((item, index) => (
                                        <tr key={`${item.employeeID}-${index}`}>
                                            <td>{item.employeeID}</td>

                                            <td>{item.employeeName}</td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.bdL_Total,
                                                    item.bdL_Submitted,
                                                    item.bdL_Balance
                                                )}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.pL_Total,
                                                    item.pL_Submitted,
                                                    item.pL_Balance
                                                )}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.wfH_Total,
                                                    item.wfH_Submitted,
                                                    item.wfH_Balance
                                                )}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.wfhX_Total,
                                                    item.wfhX_Submitted,
                                                    item.wfhX_Balance
                                                )}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.sL_Total,
                                                    item.sL_Submitted,
                                                    item.sL_Balance
                                                )}
                                            </td>

                                            <td>
                                                {(item.isPTLapplicable ?? item.isPTLApplicable)
                                                    ? formatLeaveValue(
                                                        item.ptL_Total,
                                                        item.ptL_Submitted,
                                                        item.ptL_Balance
                                                    )
                                                    : "NA"}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.cL_Total,
                                                    item.cL_Submitted,
                                                    item.cL_Balance
                                                )}
                                            </td>

                                            <td>
                                                {formatLeaveValue(
                                                    item.asL_Total,
                                                    item.asL_Submitted,
                                                    item.asL_Balance
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                    {showResult &&
                        reportType === "Leave Details" &&
                        leaveDetailsData.length > 0 && (
                            <table className="summary-report-table">
                                <thead>
                                    <tr>
                                        <th>Requester Name</th>
                                        <th>Emp ID</th>
                                        <th>Leave Type</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Days</th>
                                        <th>Submission Date</th>
                                        <th>Approved Date</th>
                                        <th>Status</th>
                                        <th>Approver Name</th>
                                        <th>Team Name</th>
                                        <th>Reason</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {leaveDetailsData.map(
                                        (item, index) => (
                                            <tr key={index}>
                                                <td>{item.requesterName}</td>
                                                <td>{item.employeeId}</td>
                                                <td>{getLeaveTypeDisplay(item)}</td>
                                                <td>{item.startDate}</td>
                                                <td>{item.endDate}</td>
                                                <td>{item.noOfDays}</td>
                                                <td>{item.submitionDate}</td>
                                                <td>{item.dateofapproved}</td>

                                                <td>
                                                    <span
                                                        className={`summary-status-badge ${getStatusClass(
                                                            item.statusCode
                                                        )}`}
                                                    >
                                                        {getStatusClass(item.statusCode)}
                                                    </span>
                                                </td>

                                                <td>{item.approverName}</td>
                                                <td>{item.teamName}</td>
                                                <td>{item.reason}</td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        )}
                    {showResult &&
                        reportType === "Emergency Contact" &&
                        emergencyContactData.length > 0 && (
                            <table className="summary-report-table">
                                <thead>
                                    <tr>
                                        <th>Emp ID</th>
                                        <th>Employee Name</th>
                                        <th>Contact Name 1</th>
                                        <th>Contact No1</th>
                                        <th>Contact Name 2</th>
                                        <th>Contact No2</th>
                                        <th>Team Name</th>
                                        <th>Team Manager</th>
                                        <th>Team Head</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {emergencyContactData.map((item, index) => (
                                        <tr key={`${getEmergencyContactValue(item, "empId", "employeeId")}-${index}`}>
                                            <td>{getEmergencyContactValue(item, "empId", "employeeId")}</td>
                                            <td>{getEmergencyContactValue(item, "empName", "employeeName")}</td>
                                            <td>
                                                {getEmergencyContactValue(
                                                    item,
                                                    "contactNoName1",
                                                    "contactName1",
                                                    "contactName"
                                                )}
                                            </td>
                                            <td>{getEmergencyContactValue(item, "contactNo1", "contactNumber1")}</td>
                                            <td>{getEmergencyContactValue(item, "contactNoName2", "contactName2")}</td>
                                            <td>{getEmergencyContactValue(item, "contactNo2", "contactNumber2")}</td>
                                            <td>{getEmergencyContactValue(item, "teamName")}</td>
                                            <td>{getEmergencyContactValue(item, "managerName")}</td>
                                            <td>{getEmergencyContactValue(item, "headName")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                </div>
            </div>
        </section>
    );
};

export default SummaryReport;
