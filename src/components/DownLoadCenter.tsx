import './DownloadCenter.css';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getEmployeeContact,
    getLeaveBalanceForExcelByManagerId,
    getLeaveDetailsForExcelByManagerId
} from '../services/apiService';
import type {
    EmployeeContactApi,
    EmployeeContactResponse,
    ManagerLeaveBalanceExcelApi,
    ManagerLeaveDetailsExcelApi
} from '../types/apiTypes';
import { pdfjs } from 'react-pdf';
import worker from 'pdfjs-dist/build/pdf.worker?url';
import { CsvExportUtil } from '../utils/CsvExportUtil';
import { PdfExportUtil } from '../utils/PdfExportUtil';
import { useAuth } from '../auth/useAuth';
pdfjs.GlobalWorkerOptions.workerSrc = worker;

type ReportType = "leave-details" | "leave-balance" | "emergency-contact";

type ReportConfig = {
    key: ReportType;
    label: string;
    fileBaseName: string;
    emptyMessage: string;
    loadData: (userId: string) => Promise<unknown[]>;
    buildPdf: (data: unknown[]) => Blob;
    buildCsv: (data: unknown[]) => string;
};

const REPORT_CONFIG: Record<ReportType, ReportConfig> = {
    "leave-details": {
        key: "leave-details",
        label: "Leave Reports",
        fileBaseName: "leave-details-report",
        emptyMessage: "No leave details available.",
        loadData: (userId) => getLeaveDetailsForExcelByManagerId(userId),
        buildPdf: (data) => PdfExportUtil.generateManagerLeaveDetailsPdf(data as ManagerLeaveDetailsExcelApi[]),
        buildCsv: (data) => CsvExportUtil.generateManagerLeaveDetailsCsv(data as ManagerLeaveDetailsExcelApi[])
    },
    "leave-balance": {
        key: "leave-balance",
        label: "Leave Balance",
        fileBaseName: "leave-balance-report",
        emptyMessage: "No leave balance data available.",
        loadData: (userId) => getLeaveBalanceForExcelByManagerId(userId),
        buildPdf: (data) => PdfExportUtil.generateManagerLeaveBalancePdf(data as ManagerLeaveBalanceExcelApi[]),
        buildCsv: (data) => CsvExportUtil.generateManagerLeaveBalanceCsv(data as ManagerLeaveBalanceExcelApi[])
    },
    "emergency-contact": {
        key: "emergency-contact",
        label: "Emergency Contact",
        fileBaseName: "emergency-contact-report",
        emptyMessage: "No emergency contact details available.",
        loadData: async (userId) => {
            const response: EmployeeContactResponse = await getEmployeeContact(userId);
            return response?.isSuccess ? response.employeeEmergencyContactDetails : [];
        },
        buildPdf: (data) => PdfExportUtil.generateEmergencyContactPdf(data as EmployeeContactApi[]),
        buildCsv: (data) => CsvExportUtil.generateEmergencyContactCsv(data as EmployeeContactApi[])
    }
};

const DownLoadCenter = () => {
    const [searchParams] = useSearchParams();
    const [activeReport, setActiveReport] = useState<ReportType>("emergency-contact");
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [excelDownloadUrl, setExcelDownloadUrl] = useState<string>("");
    const [recordCount, setRecordCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement | null>(null);
    const { user } = useAuth();

    // Read URL parameter and set active report
    useEffect(() => {
        const reportType = searchParams.get("type") as ReportType | null;
        if (reportType && reportType in REPORT_CONFIG) {
            setActiveReport(reportType);
        }
    }, [searchParams]);

    useEffect(() => {
        let pdfObjectUrl = "";
        let csvObjectUrl = "";
        let isMounted = true;

        if (!user?.loginUserAdID) {
            setPdfUrl("");
            setExcelDownloadUrl("");
            setRecordCount(0);
            return;
        }

        const fetchReport = async () => {
            const userId = String(user.loginUserAdID).trim();
            const selectedReport = REPORT_CONFIG[activeReport];

            try {
                setLoading(true);
                setError("");
                setIsDownloadMenuOpen(false);
                setRecordCount(0);

                const data = await selectedReport.loadData(userId);
                if (!isMounted) return;

                if (pdfObjectUrl) {
                    URL.revokeObjectURL(pdfObjectUrl);
                    pdfObjectUrl = "";
                }
                if (csvObjectUrl) {
                    URL.revokeObjectURL(csvObjectUrl);
                    csvObjectUrl = "";
                }

                const safeData = Array.isArray(data) ? data : [];
                setRecordCount(safeData.length);

                if (safeData.length > 0) {
                    const pdfBlob = selectedReport.buildPdf(safeData);
                    const csv = selectedReport.buildCsv(safeData);
                    const csvBlob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });

                    pdfObjectUrl = URL.createObjectURL(pdfBlob);
                    csvObjectUrl = URL.createObjectURL(csvBlob);
                    setPdfUrl(pdfObjectUrl);
                    setExcelDownloadUrl(csvObjectUrl);
                    return;
                }

                setPdfUrl("");
                setExcelDownloadUrl("");
            } catch {
                if (!isMounted) return;
                setError(`Unable to load ${selectedReport.label.toLowerCase()}.`);
                setPdfUrl("");
                setExcelDownloadUrl("");
                setRecordCount(0);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        void fetchReport();

        return () => {
            isMounted = false;
            if (pdfObjectUrl) {
                URL.revokeObjectURL(pdfObjectUrl);
            }
            if (csvObjectUrl) {
                URL.revokeObjectURL(csvObjectUrl);
            }
        };
    }, [activeReport, user?.loginUserAdID]);

    useEffect(() => {
        const closeMenuOnOutsideClick = (event: MouseEvent) => {
            if (
                downloadMenuRef.current &&
                !downloadMenuRef.current.contains(event.target as Node)
            ) {
                setIsDownloadMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", closeMenuOnOutsideClick);
        return () => {
            document.removeEventListener("mousedown", closeMenuOnOutsideClick);
        };
    }, []);


    return (
        <section className="emergency-page">
            <div className="emergency-container">
                <div className="emergency-card">
                    <div className="emergency-header">
        <h2 className="emergency-title">Reports & Records</h2>
    </div>

                    <div className="emergency-card-body">
                        <div className="viewer-actions">
                            <div className="report-tabs" role="tablist" aria-label="Export report views">
                                {Object.values(REPORT_CONFIG).map((report) => (
                                    <button
                                        key={report.key}
                                        type="button"
                                        className={`report-tab-button ${activeReport === report.key ? "active" : ""}`}
                                        onClick={() => setActiveReport(report.key)}
                                    >
                                        {report.label}
                                    </button>
                                ))}
                            </div>
                            {!loading && !error && (pdfUrl || excelDownloadUrl) && (
                                <div className="download-menu" ref={downloadMenuRef}>
                                    <button
                                        type="button"
                                        className="download-icon-button"
                                        aria-label="Download options"
                                        onClick={() => setIsDownloadMenuOpen((open) => !open)}
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M5 20h14v-2H5v2zm7-18v10.17l3.59-3.58L17 10l-5 5-5-5 1.41-1.41L11 12.17V2h2z" />
                                        </svg>
                                    </button>
                                    {isDownloadMenuOpen && (
                                        <div className="download-menu-list">
                                            {pdfUrl && (
                                                <a
                                                    className="download-menu-item"
                                                    href={pdfUrl}
                                                    download={`${REPORT_CONFIG[activeReport].fileBaseName}.pdf`}
                                                    onClick={() => setIsDownloadMenuOpen(false)}
                                                >
                                                    Download PDF
                                                </a>
                                            )}
                                            {excelDownloadUrl && (
                                                <a
                                                    className="download-menu-item"
                                                    href={excelDownloadUrl}
                                                    download={`${REPORT_CONFIG[activeReport].fileBaseName}.csv`}
                                                    onClick={() => setIsDownloadMenuOpen(false)}
                                                >
                                                    Download Excel
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="viewer-panel">
                            <div className="viewer-container">
                                {loading && <div className="viewer-status">Loading...</div>}
                                {!loading && error && <div className="viewer-status">{error}</div>}
                                {!loading && !error && recordCount > 0 && (
                                    <iframe
                                        src={`${pdfUrl}#toolbar=1`}
                                        title={`${REPORT_CONFIG[activeReport].label} PDF Viewer`}
                                        width="100%"
                                        height="100%"
                                    />
                                )}
                                {!loading && !error && recordCount === 0 && (
                                    <div className="viewer-status">{REPORT_CONFIG[activeReport].emptyMessage}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default DownLoadCenter;
