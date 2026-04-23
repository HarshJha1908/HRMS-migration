import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getJobVacancies, updateCareer, addCareer } from "../services/apiService";
import type { JobVacancyApi } from "../types/apiTypes";
import "./JobVacancy.css";

interface CareerFormData {
  isrr: string;
  career: string;
  position: string;
  department: string;
  file: File | null;
  active: boolean;
}

export default function JobVacancy() {
  const CURRENT_USER_ID = "in091a";
  const [vacancies, setVacancies] = useState<JobVacancyApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CareerFormData>({
    isrr: "",
    career: "",
    position: "",
    department: "",
    file: null,
    active: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancyApi | null>(null);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const response = await getJobVacancies();

      console.log("Load vacancies response:", response);

      if (Array.isArray(response)) {
        setVacancies(response);
      } else if (response?.isSuccess && response?.data) {
        setVacancies(response.data);
      } else {
        setError("Failed to load job vacancies");
      }
    } catch (err) {
      console.error("Error loading vacancies:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
  }, []);

  const openModal = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingVacancy(null);
    setFormData({
      isrr: "",
      career: "",
      position: "",
      department: "",
      file: null,
      active: true,
    });
  };

  const handleUpdate = (vacancy: JobVacancyApi) => {
    setIsEditing(true);
    setEditingVacancy(vacancy);
    setFormData({
      isrr: vacancy.isrrnum.toString(),
      career: vacancy.type,
      position: vacancy.title,
      department: vacancy.department,
      file: null,
      active: vacancy.isActive,
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formData.isrr.trim() || Number.isNaN(Number(formData.isrr))) {
      setError("Please enter a valid ISRR number.");
      return;
    }

    if (!formData.career.trim() || !formData.position.trim() || !formData.department.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!isEditing && !formData.file) {
      setError("Please upload a PDF file while creating a new job.");
      return;
    }

    try {
      const career = {
        id: isEditing ? editingVacancy?.id : undefined,
        title: formData.position,
        type: formData.career,
        department: formData.department,
        userId: editingVacancy?.userId || CURRENT_USER_ID,
        isActive: formData.active,
        isrrnum: Number(formData.isrr),
      };

      console.log("Career object:", career);

      const submitFormData = new FormData();
      submitFormData.append("CareerJson", JSON.stringify(career));

      if (formData.file) {
        submitFormData.append("Attachment", formData.file);
      }

      console.log("FormData contents:");
      for (const [key, value] of submitFormData.entries()) {
        console.log(key, value);
      }

      let response;

      if (isEditing) {
        response = await updateCareer(submitFormData);
      } else {
        response = await addCareer(submitFormData);
      }

      console.log("API Response:", response);

      if (response?.isSuccess) {
        alert(isEditing ? "Updated successfully!" : "Added successfully!");
        await loadVacancies();
        closeModal();
      } else {
        const failureMessage = response?.message || "Operation failed.";
        setError(failureMessage);
        alert(failureMessage);
      }

    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to save. Please check your input and try again.";
      setError(message);
      alert(message);
    }
  };

  return (
    <div className="job-vacancy-container">
      <div className="jv-header-section">
        <h2 className="jv-page-title">Job Vacancy</h2>
        <button className="jv-add-job-btn" onClick={openModal}>
          + Add New Job
        </button>
      </div>

      <div className="jv-content">
       

        <div className="jv-main">
          {loading && <p className="jv-loading">Loading job vacancies...</p>}
          
          {error && <p className="jv-error">Error: {error}</p>}
          
          {!loading && !error && vacancies.length === 0 && (
            <p className="jv-no-data">No job vacancies available</p>
          )}

          {!loading && !error && vacancies.length > 0 && (
            <table className="jv-table">
              <thead>
                <tr>
                  <th>ISRR</th>
                  <th>Position</th>
                  <th>Team</th>
                  <th>Publish Date (DD/MM/YYYY)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((vacancy, index) => (
                  <tr key={index}>
                    <td>{vacancy.isrrnum}</td>
                    <td>{vacancy.title}</td>
                    <td>{vacancy.department}</td>
                    <td>{(vacancy.updatedDate)}</td>
                    <td>
                      <button className="jv-update-btn" onClick={() => handleUpdate(vacancy)}>Update</button>
                      <a href={`/job-vacancy/${vacancy.id}`} className="jv-view-link">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="jv-modal-overlay" onClick={closeModal}>
          <div className="jv-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="jv-modal-title">{isEditing ? "Update Career" : "Manage Career"}</h2>
            <form className="jv-modal-form" onSubmit={handleSubmit}>
              <div className="jv-form-group">
                <label htmlFor="isrr">ISRR<span className="jv-required">*</span></label>
                <input
                  id="isrr"
                  type="text"
                  name="isrr"
                  value={formData.isrr}
                  onChange={handleInputChange}
                  placeholder=""
                  required
                />
              </div>

              <div className="jv-form-group">
                <label htmlFor="career">Please select<span className="jv-required">*</span></label>
                <select
                  id="career"
                  name="career"
                  value={formData.career}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Add New Career</option>
                  <option value="Associate">Associate</option>
                  <option value="Full-Time">FTE</option>
                  
                </select>
              </div>

              <div className="jv-form-group">
                <label htmlFor="position">Position<span className="jv-required">*</span></label>
                <input
                  id="position"
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder=""
                  required
                />
              </div>

              <div className="jv-form-group">
                <label htmlFor="department">Department<span className="jv-required">*</span></label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder=""
                  required
                />
              </div>

              <div className="jv-form-group">
                <label htmlFor="file">Upload Job Description File (PDF format)</label>
                <input
                  id="file"
                  type="file"
                  name="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </div>

              <div className="jv-form-group jv-checkbox-group">
                <label htmlFor="active">
                  <input
                    id="active"
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>

              <button type="submit" className="jv-save-btn">{isEditing ? "Update" : "Save"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

