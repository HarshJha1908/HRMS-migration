import './EmergencyContact.css';
import { useEffect, useRef, useState } from 'react';
import { getEmployeeContact } from '../services/apiService';
import type { EmployeeContactApi, EmployeeContactResponse } from '../types/apiTypes';
import { pdfjs } from 'react-pdf';
import worker from 'pdfjs-dist/build/pdf.worker?url';
import { CsvExportUtil, PdfExportUtil } from '../utils/Utils';
pdfjs.GlobalWorkerOptions.workerSrc = worker;

const EmergencyContact = () => {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [excelDownloadUrl, setExcelDownloadUrl] = useState<string>("");
    const [contacts, setContacts] = useState<EmployeeContactApi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let pdfObjectUrl = "";
        let csvObjectUrl = "";
        let isMounted = true;

        const fetchContacts = async () => {
            const userId = "in091a";

            try {
                setLoading(true);
                setError("");
                const response: EmployeeContactResponse = await getEmployeeContact(userId);
                if (!isMounted) return;

                if (response.isSuccess) {
                    const emergencyContacts = response.employeeEmergencyContactDetails;
                    const blob = PdfExportUtil.generateEmergencyContactPdf(
                        emergencyContacts
                    );
                    const csv = CsvExportUtil.generateEmergencyContactCsv(emergencyContacts);
                    const csvBlob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });

                    pdfObjectUrl = URL.createObjectURL(blob);
                    csvObjectUrl = URL.createObjectURL(csvBlob);
                    setPdfUrl(pdfObjectUrl);
                    setExcelDownloadUrl(csvObjectUrl);
                    setContacts(emergencyContacts);
                    return;
                }

                setError("Unable to load emergency contact details.");
                setPdfUrl("");
                setExcelDownloadUrl("");
                setContacts([]);
            } catch {
                if (!isMounted) return;
                setError("Unable to load emergency contact details.");
                setPdfUrl("");
                setExcelDownloadUrl("");
                setContacts([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchContacts();

        return () => {
            isMounted = false;
            if (pdfObjectUrl) {
                URL.revokeObjectURL(pdfObjectUrl);
            }
            if (csvObjectUrl) {
                URL.revokeObjectURL(csvObjectUrl);
            }
        };
    }, []);

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
                    <div className="emergency-card-body">
                        <div className="viewer-actions">
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
                                                    download="emergency-contact-report.pdf"
                                                    onClick={() => setIsDownloadMenuOpen(false)}
                                                >
                                                    Download PDF
                                                </a>
                                            )}
                                            {excelDownloadUrl && (
                                                <a
                                                    className="download-menu-item"
                                                    href={excelDownloadUrl}
                                                    download="emergency-contact-report.csv"
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
                                {!loading && !error && contacts.length > 0 && (
                                    <iframe
                                        src={`${pdfUrl}#toolbar=1`}
                                        title="PDF Viewer"
                                        width="100%"
                                        height="100%"
                                    />
                                )}
                                {!loading && !error && !contacts.length && (
                                    <div className="viewer-status">No emergency contact details available.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default EmergencyContact;
