import { useEffect, useState } from 'react';
import './DocumentViewer.css';
import { getDocuments, getDocumentTypes, getDocumentFile, addDocument, searchDocuments, updateDocument } from '../services/apiService';
import type { DocumentApi } from '../types/apiTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { invalidateApiGetCache } from "../services/apiClient";
import { faFileLines } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useSearchParams } from "react-router-dom";


interface DocumentViewerProps {
  documentType: string;
  documentTypeName: string;
}

export default function DocumentViewer({ documentType }: DocumentViewerProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const role = searchParams.get("role");
  const isAdmin = role === "admin";

  const [docTypes, setDocTypes] = useState<{ docCode: string; typeName: string }[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [documents, setDocuments] = useState<DocumentApi[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentApi | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [, setIsSearching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    isLink: false,
    isActive: true,
    file: null as File | null
  });

  const toggleSidebar = () => {
    setIsSidebarOpen((current) => !current);
  };

  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const docs = await getDocuments(documentType);
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocument(docs[0]); //selecting 1 for Pdf preview by default
        }
      } catch (err) {
        setError('Unable to load document list. Try refreshing the page.');
        console.error('Error loading documents:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [documentType]);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoadingTypes(true);
        const types = await getDocumentTypes();
        setDocTypes(types);
      } catch (err) {
        console.error("Failed to load document types", err);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadTypes();
  }, []);

  useEffect(() => {
    let pdfObjectUrl = "";

    const fetchPdf = async () => {
      if (!selectedDocument?.id) {
        setPdfUrl("");
        return;
      }

      setPdfLoading(true);
      try {
        if (pdfObjectUrl) {
          URL.revokeObjectURL(pdfObjectUrl);
        }

        const blob = await getDocumentFile(selectedDocument.id);
        const fixedBlob = new Blob([blob], { type: "application/pdf" });
        // const excelBlob=new Blob([blob], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        pdfObjectUrl = URL.createObjectURL(fixedBlob);
        setPdfUrl(pdfObjectUrl);
      } catch (err) {
        console.error('Error fetching PDF:', err);
        setPdfUrl("");
      } finally {
        setPdfLoading(false);
      }
    };

    void fetchPdf();

    return () => {
      if (pdfObjectUrl) {
        URL.revokeObjectURL(pdfObjectUrl);
      }
    };
  }, [selectedDocument]);

  useEffect(() => {
    const delay = setTimeout(() => {
      handleSearch(searchText);
    }, 400);

    return () => clearTimeout(delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.isLink && !formData.file && !isEditMode && !selectedDocument?.fileName) {
      alert('Please upload a file');
      return;
    }

    if (formData.isLink && !formData.link.trim()) {
      alert('Please provide a link URL');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && selectedDocument) {
        // If no new file is chosen, keep the old file
        await updateDocument(
          selectedDocument.id,
          formData.title,
          documentType,
          formData.isLink ? formData.link : '',
          formData.isLink,
          formData.isActive,
          formData.file || undefined // If file is null/undefined, backend should keep old file
        );
        // Fetch latest documents and update state instantly
        invalidateApiGetCache();
        const docs = await getDocuments(documentType);
        setDocuments(docs);
        // Always set selectedDocument to the updated one from backend
        const updated = docs.find(doc => doc.id === selectedDocument.id);
        setSelectedDocument(updated || docs[0] || null);
      } else {
        // ✅ ADD
        await addDocument(
          formData.title,
          documentType,
          formData.isLink ? formData.link : '',
          formData.isLink,
          formData.file || undefined
        );
        // Fetch latest documents and update state instantly

        invalidateApiGetCache();
        const docs = await getDocuments(documentType);
        setDocuments(docs);
        setSelectedDocument(docs[docs.length - 1] || null);
      }

      // close + reset
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ title: '', link: '', isLink: false, isActive: true, file: null });

      // 🔁 optional sync with backend (safe)
      setTimeout(async () => {
        const docs = await getDocuments(documentType);
        setDocuments(docs);
      }, 300);

      // reset
      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ title: '', link: '', isLink: false, isActive: true, file: null });

    } catch (err) {
      console.error(err);
      alert('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.currentTarget;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files?.[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
 
  const handleSearch = async (value: string) => {
    setSearchText(value);

    // 🔁 RESET to original list when cleared
    if (!value.trim()) {
      const docs = await getDocuments(documentType);
      setDocuments(docs);
      setSelectedDocument(docs[0] || null); // 👈 IMPORTANT
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchDocuments(value);
      setDocuments(results);
      setSelectedDocument(results[0] || null);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };
  const handleEditClick = (doc: DocumentApi) => {
    setSelectedDocument(doc);
    setFormData({
      title: doc.title || "",
      link: doc.link || "",
      isLink: !!doc.link && doc.link !== "x", // Only true if link is a real URL
      isActive: doc.isActive !== undefined ? doc.isActive : true, // Default to true if not specified
      file: null // don’t preload file
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  return (
    <div className="document-viewer">

      {/* <header className="document-page-header">
        <div>
          <p className="page-label">Document Library</p>
          <h1>{documentTypeName}</h1>
          <p className="page-copy">Browse the available files for this category and select one to preview.</p>
        </div>
      </header> */}

      <section className={`document-grid ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
        <aside className={`document-sidebar ${isSidebarOpen ? '' : 'collapsed'}`}>
          <div className="sidebar-panel">

            {/* 🔹 HEADER */}
            <div className="sidebar-header">
              <div className="header-left">
                {/* <span className="sidebar-main-title">
                  {docTypes.find(d => d.docCode === documentType)?.typeName || documentTypeName}
                </span> */}

                <select
                  className="doc-switch-dropdown"
                  value={documentType}
                  onChange={(e) => {
                    const selected = e.target.value;
                    navigate(`/documents/${selected}${role ? `?role=${role}` : ""}`);
                  }}
                >
                  {loadingTypes ? (
                    <option>Loading...</option>
                  ) : docTypes.length === 0 ? (
                    <option>No Types</option>
                  ) : (
                    docTypes.map((opt) => (
                      <option key={opt.docCode} value={opt.docCode}>
                        {opt.typeName}
                      </option>
                    ))
                  )}
                </select>
              </div>


              <div className="sidebar-actions">
                {isAdmin && (
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => {
                    setIsEditMode(false);
                    setFormData({ title: '', link: '', isLink: false, isActive: true, file: null });
                    setIsModalOpen(true);
                  }}
                  title="Add new document"
                  aria-label="Add new document"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
                )}
                <button
                  className="icon-btn"
                  title="Search"
                  onClick={() => setIsSearchActive(prev => !prev)}
                >
                  <FontAwesomeIcon icon={faSearch} />
                </button>
                <button
                  className="icon-btn"
                  onClick={toggleSidebar}
                  title="Collapse"
                >
                  {isSidebarOpen ? '❮' : '❯'}
                </button>
              </div>
            </div>

            {/* 🔹 SEARCH */}
            <div className={`sidebar-search ${isSearchActive ? "active" : ""}`}>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                autoFocus={isSearchActive}
                onBlur={() => {
                  if (!searchText) setIsSearchActive(false);
                }}
              />
            </div>

            {/* 🔹 LIST */}
            {error ? (
              <div className="sidebar-error">{error}</div>
            ) : documents.length === 0 && loading ? (
              <div className="sidebar-empty">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="sidebar-empty">No documents found</div>
            ) : (
              <ul className="sidebar-list">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className={`sidebar-item ${selectedDocument?.id === doc.id ? 'active' : ''}`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    {/* LEFT */}
                    <div className="item-left">
                      <span className="folder-icon"><FontAwesomeIcon icon={faFileLines} /></span>

                      <span className="item-title" title={doc.title}>{doc.title}</span>
                    </div>

                    {/* RIGHT */}
                    <div className="item-right">
                      {isAdmin && (
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(doc);
                        }}
                      >
                        ✏️
                      </button>
                      )}

                      <span className="file-arrow">›</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </div>
        </aside>

        <main className="document-main">
          <div className="preview-card">


            <div className="preview-body">
              {!selectedDocument ? (
                <div className="preview-empty">
                  <p>Choose a file on the left to see the content here.</p>
                </div>
              ) : pdfLoading ? (
                <div className="viewer-status">Loading PDF...</div>
              ) : pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=1`}
                  title={`${selectedDocument.title} PDF Viewer`}
                  className="preview-iframe"
                  width="100%"
                  height="100%"
                />
              ) : (
                <div className="preview-empty">
                  <p>Document preview is not available for this file.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </section>

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? "Edit Document" : "Add New Document"}</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="add-document-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="Enter document title"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isLink"
                    checked={formData.isLink}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                  />
                  Use external link instead of file
                </label>
              </div> */}

              {formData.isLink ? (
                <div className="form-group">
                  <label htmlFor="link">Link URL *</label>
                  <input
                    type="url"
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleFormChange}
                    placeholder="https://example.com/document.pdf"
                    disabled={isSubmitting}
                    required={formData.isLink}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="file">Upload File *</label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFormChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    disabled={isSubmitting}
                    required={!formData.isLink}
                  />
                  <small>Accepted formats: PDF</small>
                </div>
              )}

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    disabled={isSubmitting}
                  />
                  Active
                </label>
              </div>

              <div className="form-actions">
                
                <button type="submit" className="button-primary" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditMode ? 'Updating...' : 'Adding...'
                    : isEditMode ? 'Update Document' : 'Add Document'}
                </button>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
