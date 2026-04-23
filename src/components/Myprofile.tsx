import { useEffect, useMemo, useState } from "react";
import "../pages/SingleSearchDetails.css";
import "./Myprofile.css";
import {
    getEmpProfileByEmpId,
    getEmployeeContact,
    updateEmergencyContactDetails
} from "../services/apiService";

type EmployeeSearchItem = {
    user_Employee_No?: string | number;
    user_Id?: string;
    name?: string;
    empName?: string;
    user_Doj?: string;
    user_Email_Id?: string;
    teamName?: string;
    teamManagerName?: string;
    teamHeadName?: string;
    status?: string;
    user_Sex?: string;
    lwd?: string | null;
    isActive?: boolean;
    user_Mat_Pat_Applicable?: boolean;
    emergencyContactNo1?: string;
    emergencyContactNo2?: string;
    contactName1?: string;
    contactName2?: string;
    [key: string]: unknown;
};

type ContactDetails = {
    contactNo1?: string;
    contactNo2?: string;
    contactNoName1?: string;
    contactNoName2?: string;
    managerName?: string;
    headName?: string;
};

type EmergencyContactForm = {
    contactNoName1: string;
    contactNo1: string;
    contactNoName2: string;
    contactNo2: string;
};

type EmergencyContactFieldErrors = Partial<Record<keyof EmergencyContactForm, string>>;

const pickAdId = (employee?: EmployeeSearchItem | null) =>
    String(employee?.user_Id || "").trim();

const pickEmpNo = (employee?: EmployeeSearchItem | null) =>
    String(employee?.user_Employee_No || "").trim();

const formatDate = (value?: string | null) => {
    if (!value) return "NA";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "NA" : date.toLocaleDateString("en-GB");
};

const toNumber = (value: unknown, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
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

const toEditableContact = (
    profile: EmployeeSearchItem | null,
    contact: ContactDetails | null
): EmergencyContactForm => ({
    contactNoName1: String(contact?.contactNoName1 || profile?.contactName1 || ""),
    contactNo1: String(contact?.contactNo1 || profile?.emergencyContactNo1 || ""),
    contactNoName2: String(contact?.contactNoName2 || profile?.contactName2 || ""),
    contactNo2: String(contact?.contactNo2 || profile?.emergencyContactNo2 || "")
});

const normalizePhoneInput = (value: string) => value.replace(/\D/g, "").slice(0, 10);

const validateEmergencyContactForm = (form: EmergencyContactForm): EmergencyContactFieldErrors => {
    const errors: EmergencyContactFieldErrors = {};
    const isValid10Digit = /^\d{10}$/;

    if (!form.contactNo1) {
        errors.contactNo1 = "Contact Number 1 is required.";
    } else if (!isValid10Digit.test(form.contactNo1)) {
        errors.contactNo1 = "Contact Number 1 must be 10 digits.";
    }

    if (form.contactNo2 && !isValid10Digit.test(form.contactNo2)) {
        errors.contactNo2 = "Contact Number 2 must be 10 digits.";
    }

    if (form.contactNo1 && form.contactNo2 && form.contactNo1 === form.contactNo2) {
        errors.contactNo2 = "Contact Number 2 must be different from Contact Number 1.";
    }

    return errors;
};


 
export default function MyProfile() {
    const [profile, setProfile] = useState<EmployeeSearchItem | null>(null);
    const [contact, setContact] = useState<ContactDetails | null>(null);
    const [contactForm, setContactForm] = useState<EmergencyContactForm>({
        contactNoName1: "",
        contactNo1: "",
        contactNoName2: "",
        contactNo2: ""
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<EmergencyContactFieldErrors>({});

     const fullName = useMemo(
    () => String(profile?.empName || profile?.name || profile?.user_Fname || "NA"),
    [profile]
  );

   const statusText = useMemo(() => {
    const profileStatus = String(profile?.status || "").trim();
    if (profileStatus) return profileStatus;
    return profile?.isActive === false ? "Inactive" : "Active";
  }, [profile]);

 
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError("");
                const empId = "90001199"; // This should ideally come from auth context or route state
                const profileResponse = await getEmpProfileByEmpId(empId);    
                setProfile(profileResponse);

                const adId = pickAdId(profileResponse);

                if (adId) {
                    try {
                        const contactResponse = await getEmployeeContact(adId);
                        const list = contactResponse?.employeeEmergencyContactDetails;

                        if (Array.isArray(list) && list.length > 0) {
                            const selectedContact = list[0] as ContactDetails;
                            setContact(selectedContact);
                            setContactForm(toEditableContact(profileResponse, selectedContact));
                            return;
                        }
                    } catch {
                        // keep profile fallback
                    }
                }

                setContact(null);
                setContactForm(toEditableContact(profileResponse, null));
            }


            catch (err) {
                console.error(err);
                setError("Failed to load profile details.");
            } finally {
                setLoading(false);
            }
        };

        

        loadProfile();
    }
        , []);

    const handleContactFieldChange = (field: keyof EmergencyContactForm, value: string) => {
        const nextValue =
            field === "contactNo1" || field === "contactNo2"
                ? normalizePhoneInput(value)
                : value;

        setContactForm((prev) => ({ ...prev, [field]: nextValue }));
        setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        setSaveMessage("");
        setSaveError("");
    };

    const handleSaveEmergencyContact = async () => {
        if (!profile) return;

        const empIdRaw = pickEmpNo(profile);
        const adId = pickAdId(profile);
        const empId = Number(empIdRaw);

        if (!adId || !Number.isFinite(empId)) {
            setSaveError("Unable to save emergency contact details due to missing employee identifiers.");
            return;
        }

        const cleanedForm: EmergencyContactForm = {
            contactNoName1: contactForm.contactNoName1.trim(),
            contactNo1: contactForm.contactNo1.trim(),
            contactNoName2: contactForm.contactNoName2.trim(),
            contactNo2: contactForm.contactNo2.trim()
        };

        const validationErrors = validateEmergencyContactForm(cleanedForm);
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            setSaveError("Please correct the highlighted contact number fields.");
            setSaveMessage("");
            return;
        }

        setFieldErrors({});

        const nameParts = splitFullName(
            String(profile.empName || profile.name || profile.user_Fname || "").trim()
        );

        const payload = {
            user_Employee_No: toNumber(profile.user_Employee_No, empId),
            user_Seq_No: extractUserSeqNo(profile),
            user_Id: String(profile.user_Id || adId).trim(),
            user_Fname: String(profile.user_Fname || nameParts.firstName || "").trim(),
            user_Mname: String(profile.user_Mname || nameParts.middleName || "").trim(),
            user_Lname: String(profile.user_Lname || nameParts.lastName || "").trim(),
            user_Doj: String(profile.user_Doj || ""),
            user_Email_Id: String(profile.user_Email_Id || "").trim(),
            user_Line_Mng: toNumber(profile.user_Line_Mng, 0),
            user_Line_Mng_1: toNumber(profile.user_Line_Mng_1, 0),
            isActive: profile.isActive !== false,
            eligibleTypeCode: String(profile.eligibleTypeCode || ""),
            lwd: String(profile.lwd || ""),
            user_Sex: String(profile.user_Sex || ""),
            user_Mat_Pat_Applicable: Boolean(profile.user_Mat_Pat_Applicable),
            emergencyContactNo1: cleanedForm.contactNo1,
            emergencyContactNo2: cleanedForm.contactNo2,
            contactName2: cleanedForm.contactNoName2,
            contactName1: cleanedForm.contactNoName1,
            lastUpdate: new Date().toISOString()
        };

        try {
            setIsSaving(true);
            setSaveError("");
            setSaveMessage("");

            const response = await updateEmergencyContactDetails(payload);

            if (response?.isSuccess === false) {
                throw new Error(response?.message || "Unable to update emergency contact details.");
            }

            setContact((prev) => ({
                ...(prev || {}),
                contactNoName1: cleanedForm.contactNoName1,
                contactNo1: cleanedForm.contactNo1,
                contactNoName2: cleanedForm.contactNoName2,
                contactNo2: cleanedForm.contactNo2
            }));

            setProfile((prev) =>
                prev
                    ? {
                          ...prev,
                          contactName1: cleanedForm.contactNoName1,
                          emergencyContactNo1: cleanedForm.contactNo1,
                          contactName2: cleanedForm.contactNoName2,
                          emergencyContactNo2: cleanedForm.contactNo2
                      }
                    : prev
            );

            setSaveMessage("Emergency contact details updated successfully.");
        } catch (saveErr) {
            const message =
                saveErr instanceof Error && saveErr.message
                    ? saveErr.message
                    : "Unable to update emergency contact details.";
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <p>Loading profile details...</p>;
    }

    return(
    <section className="my-profile-page">
        <div className="ssd-panel">
            <h2 className="ssd-title">My Profile :</h2>
            {error && <p className="ssd-error">{error}</p>}
            {!error && (
                <div className="ssd-grid">
                    <div>Emp ID:</div>
                    <div>{pickEmpNo(profile) || "NA"}</div>
                    <div>AD ID:</div>
                    <div>{pickAdId(profile) || "NA"}</div>

                    <div>Name:</div>
                    <div>{fullName}</div>
                    <div>Sex:</div>
                    <div>{String(profile?.user_Sex || "NA")}</div>

                    <div>DOJ (dd/mm/yyyy):</div>
                    <div>{formatDate(String(profile?.user_Doj || ""))}</div>
                    <div>LWD (dd/mm/yyyy):</div>
                    <div>{formatDate(String(profile?.lwd || ""))}</div>

                    <div>Is Maternity/Paternity Applicable:</div>
                    <div>{profile?.user_Mat_Pat_Applicable ? "Yes" : "No"}</div>
                    <div>Status:</div>
                    <div>{statusText}</div>

                    <div>Emergency Contact Name 1:</div>
                    <div>{String(contact?.contactNoName1 || profile?.contactName1 || "NA")}</div>
                    <div>Emergency Contact Number 1:</div>
                    <div>{String(contact?.contactNo1 || profile?.emergencyContactNo1 || "NA")}</div>

                    <div>Emergency Contact Name 2:</div>
                    <div>{String(contact?.contactNoName2 || profile?.contactName2 || "NA")}</div>
                    <div>Emergency Contact Number 2:</div>
                    <div>{String(contact?.contactNo2 || profile?.emergencyContactNo2 || "NA")}</div>

                    <div>Team Name:</div>
                    <div>{String(profile?.teamName || "NA")}</div>
                    <div>Team Head Name:</div>
                    <div>{String(contact?.headName || profile?.teamHeadName || "NA")}</div>

                    <div>Team Manager Name:</div>
                    <div>{String(contact?.managerName || profile?.teamManagerName || "NA")}</div>
                    <div />
                    <div />
                </div>
            )}
        </div>

        {!error && (
            <div className="ssd-panel">
                <h2 className="ssd-title">Emergency Contact :</h2>
                <div className="my-profile-emergency-grid">
                    <div className="my-profile-emergency-field">
                        <label htmlFor="contactNoName1">Contact Name 1 :</label>
                        <input
                            id="contactNoName1"
                            type="text"
                            value={contactForm.contactNoName1}
                            onChange={(e) => handleContactFieldChange("contactNoName1", e.target.value)}
                        />
                    </div>
                    <div className="my-profile-emergency-field">
                        <label htmlFor="contactNo1">Contact Number 1 :</label>
                        <input
                            id="contactNo1"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={contactForm.contactNo1}
                            onChange={(e) => handleContactFieldChange("contactNo1", e.target.value)}
                        />
                        {fieldErrors.contactNo1 && (
                            <p className="my-profile-field-error">{fieldErrors.contactNo1}</p>
                        )}
                    </div>
                    <div className="my-profile-emergency-field">
                        <label htmlFor="contactNoName2">Contact Name 2 :</label>
                        <input
                            id="contactNoName2"
                            type="text"
                            value={contactForm.contactNoName2}
                            onChange={(e) => handleContactFieldChange("contactNoName2", e.target.value)}
                        />
                    </div>
                    <div className="my-profile-emergency-field my-profile-emergency-action">
                        <label htmlFor="contactNo2">Contact Number 2 :</label>
                        <input
                            id="contactNo2"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={contactForm.contactNo2}
                            onChange={(e) => handleContactFieldChange("contactNo2", e.target.value)}
                        />
                        {fieldErrors.contactNo2 && (
                            <p className="my-profile-field-error">{fieldErrors.contactNo2}</p>
                        )}
                        <button
                            type="button"
                            onClick={handleSaveEmergencyContact}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
                {saveError && <p className="my-profile-save-error">{saveError}</p>}
                {saveMessage && <p className="my-profile-save-success">{saveMessage}</p>}
            </div>
        )}
    </section>

    )
};
