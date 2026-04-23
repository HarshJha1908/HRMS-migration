import { useEffect, useState } from "react";
import "./Insurance.css";
import { getInsuranceRelation } from "../services/apiService";
import type { InsuranceRelationApi } from "../types/apiTypes";

const Insurance = () => {
  const nomineeRows = [1, 2, 3, 4];
  const [insuranceType, setInsuranceType] = useState("");
  const [percentageShares, setPercentageShares] = useState(["", "", "", ""]);
  const [nomineeNames, setNomineeNames] = useState(["", "", "", ""]);
  const [nomineeDobs, setNomineeDobs] = useState(["", "", "", ""]);
  const [dobInputTypes, setDobInputTypes] = useState(["text", "text", "text", "text"]);
  const [relationships, setRelationships] = useState(["", "", "", ""]);
  const [relationshipOptions, setRelationshipOptions] = useState<InsuranceRelationApi[]>([]);
  const [reasonForChange, setReasonForChange] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const insuranceOptions = [
    { label: "Group Personal Accident", value: "GPA" },
    { label: "Group Term Life", value: "GTL" },
    { label: "Group Health Insurance", value: "GHI" },
  ];
  const defaultRelationshipOptions = ["Father", "Mother", "Spouse", "Child"];

  const insuranceTermsByType: Record<string, string> = {
    GPA: "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the GPA (Group Personal Accident) Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",
    GTL: "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the GTL (Group Term Life) Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",
    GHI: "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the GHI (Group Health Insurance) Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",
  };

  const selectedTerms = insuranceTermsByType[insuranceType];
  const isFormDisabled = insuranceType === "";
  const totalPercentageShare =
    insuranceType === "GHI"
      ? "N.A"
      : percentageShares.reduce(
          (sum, share) => sum + (share.trim() === "" ? 0 : Number(share)),
          0
        );
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (!insuranceType) {
      setRelationshipOptions([]);
      setRelationships(["", "", "", ""]);
      return;
    }

    let isMounted = true;

    const loadInsuranceRelations = async () => {
      try {
        const options = await getInsuranceRelation(insuranceType);

        if (!isMounted) return;
        setRelationshipOptions(options);
        setRelationships(["", "", "", ""]);
      } catch (error) {
        if (!isMounted) return;
        setRelationshipOptions([]);
      }
    };

    void loadInsuranceRelations();

    return () => {
      isMounted = false;
    };
  }, [insuranceType]);

  const handleSave = () => {
    if (!reasonForChange.trim()) {
      window.alert("Reason For Change is mandatory");
      return;
    }

    const payload = {
        insuranceType,
        totalPercentageShare,
        reasonForChange,
        nominees: nomineeRows.map((row, index) => ({
        slNo: `${row.toString().padStart(2, "0")}#`,
        name: nomineeNames[index],
        dob: nomineeDobs[index],
        type: insuranceType,
        relationship: relationships[index],
        percentageShare: insuranceType === "GHI" ? "N.A" : percentageShares[index],
      })),
    };

    console.log("Insurance form saved:", payload);
    window.alert("Saved successfully");
  };
  const handlePercentageShareChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const nextShares = percentageShares.map((share, shareIndex) =>
      shareIndex === index ? value : share
    );
    const nextTotal = nextShares.reduce(
      (sum, share) => sum + (share.trim() === "" ? 0 : Number(share)),
      0
    );

    if (nextTotal > 100) {
      return;
    }

    setPercentageShares((currentShares) =>
      currentShares.map((share, shareIndex) =>
        shareIndex === index ? value : share
      )
    );
  };
  const handleNomineeNameChange = (index: number, value: string) => {
    setNomineeNames((currentNames) =>
      currentNames.map((name, nameIndex) =>
        nameIndex === index ? value : name
      )
    );
  };
  const handleNomineeDobChange = (index: number, value: string) => {
    setNomineeDobs((currentDobs) =>
      currentDobs.map((dob, dobIndex) =>
        dobIndex === index ? value : dob
      )
    );
  };
  const handleDobFocus = (index: number) => {
    setDobInputTypes((currentTypes) =>
      currentTypes.map((type, typeIndex) =>
        typeIndex === index ? "date" : type
      )
    );
  };
  const handleDobBlur = (index: number) => {
    if (nomineeDobs[index]) {
      return;
    }

    setDobInputTypes((currentTypes) =>
      currentTypes.map((type, typeIndex) =>
        typeIndex === index ? "text" : type
      )
    );
  };
  const handleRelationshipChange = (index: number, value: string) => {
    setRelationships((currentRelationships) =>
      currentRelationships.map((relationship, relationshipIndex) =>
        relationshipIndex === index ? value : relationship
      )
    );
  };

  return (
    <section className="insurance-wrapper">
      <div className="insurance-card">
        <div className="insurance-title-band">
          <h2 className="form-title">
            Insurance Nomination Form - Priyanka Nag(90000226)
          </h2>
        </div>

        <div className="insurance-content">
          <div className="insurance-type-row">
            <label htmlFor="insurance-type">Insurance Type:</label>
            <select
              id="insurance-type"
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value)}
            >
              <option value="">Please Select</option>
              {insuranceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <table className="nominee-table">
            <thead>
              <tr>
                <th className="col-serial">SlNo</th>
                <th className="col-name">Name of the Nominees</th>
                <th className="col-dob">DOB (dd/mm/yyyy)</th>
                <th className="col-type">Type</th>
                <th className="col-relationship">Relationship</th>
                <th className="col-share">Percentage Share</th>
              </tr>
            </thead>

            <tbody>
              {nomineeRows.map((row, index) => (
                <tr key={row}>
                  <td className="serial-cell">{row.toString().padStart(2, "0")}#</td>

                  <td>
                    <input
                      type="text"
                      aria-label={`Nominee ${row} name`}
                      value={nomineeNames[index]}
                      disabled={isFormDisabled}
                      onChange={(e) =>
                        handleNomineeNameChange(index, e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type={dobInputTypes[index]}
                      aria-label={`Nominee ${row} date of birth`}
                      value={nomineeDobs[index]}
                      max={today}
                      disabled={isFormDisabled}
                      placeholder=""
                      onFocus={() => handleDobFocus(index)}
                      onBlur={() => handleDobBlur(index)}
                      onChange={(e) =>
                        handleNomineeDobChange(index, e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="text"
                      aria-label={`Nominee ${row} type`}
                      value={insuranceType}
                      disabled
                      readOnly
                    />
                  </td>

                  <td>
                    <select
                      aria-label={`Nominee ${row} relationship`}
                      value={relationships[index]}
                      disabled={isFormDisabled}
                      onChange={(e) =>
                        handleRelationshipChange(index, e.target.value)
                      }
                    >
                      <option value="">---SELECT---</option>
                      {(relationshipOptions.length > 0
                        ? relationshipOptions.map((relationshipOption) => relationshipOption.relationName)
                        : defaultRelationshipOptions
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      aria-label={`Nominee ${row} percentage share`}
                      value={insuranceType === "GHI" ? "N.A" : percentageShares[index]}
                      disabled={isFormDisabled}
                      readOnly={insuranceType === "GHI"}
                      onChange={(e) =>
                        handlePercentageShareChange(index, e.target.value)
                      }
                      className={`share-input ${
                        insuranceType === "GHI" ? "na-share-input" : ""
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="nominee-total-row">
                <td colSpan={5} className="nominee-total-label">
                  Total Percentage Share
                </td>
                <td className="nominee-total-value">
                  {totalPercentageShare}
                </td>
              </tr>
            </tfoot>
          </table>

          {insuranceType === "GHI" && (
            <div className="ghi-note">
              <strong>
                Note : The Group Health Insurance policy offers a coverage
                limit of INR 5 lakh per policy cycle.
              </strong>
            </div>
          )}

          {selectedTerms && (
            <div className="insurance-terms">
              <span className="insurance-terms-label">Terms:</span>{" "}
              <span>{selectedTerms}</span>
            </div>
          )}

          <div className="bottom-section">
            <div className="footer-field reason-field">
              <label htmlFor="reason-for-change">
                Reason For Change: <span className="required-asterisk">*</span>
              </label>
              <input
                id="reason-for-change"
                type="text"
                value={reasonForChange}
                disabled={isFormDisabled}
                onChange={(e) => setReasonForChange(e.target.value)}
              />
            </div>

            <div className="footer-field updated-field">
              <label>Last Updated On:</label>
              <span className="updated-value"></span>
            </div>

            <div className="footer-field terms-field">
              <label htmlFor="accept-terms">Accept Terms:</label>
              <input
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                disabled={isFormDisabled}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
            </div>

            <div className="buttons">
              <button
                className="save"
                type="button"
                onClick={handleSave}
                disabled={isFormDisabled}
              >
                Save
              </button>
              <button
                className="print"
                type="button"
                onClick={handlePrint}
                disabled={isFormDisabled}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insurance;
