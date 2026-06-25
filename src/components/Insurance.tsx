import {
  useEffect,
  useState,
  useRef,
} from "react";
import "./Insurance.css";
import { useLocation } from "react-router-dom";
import {
  getInsuranceRelations,
  getInsuranceNominationDetails,
  manageInsuranceNominationDetails,
  getEmpProfileByAdId,
  getEmpProfileByEmpId,
} from "../services/apiService";

import { useAuth } from "../auth/useAuth";
import ToastMessage from "./ToastMessage";
const Insurance = () => {
  const { user } = useAuth();
  const location = useLocation();

  const state = location.state as {
    empId?: string;
    mode?: string;
  };

  const [userId, setUserId] = useState("");

  const loggedInUserId =
    user?.loginUserAdID || "";

  const nomineeRows = [1, 2, 3, 4];

  const [insuranceType, setInsuranceType] = useState("");

  const [percentageShares, setPercentageShares] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [nomineeNames, setNomineeNames] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [nomineeDobs, setNomineeDobs] = useState([
    "",
    "",
    "",
    "",
  ]);

  // const [dobInputTypes, setDobInputTypes] = useState([
  //   "text",
  //   "text",
  //   "text",
  //   "text",
  // ]);

  const [relationships, setRelationships] = useState([
    "",
    "",
    "",
    "",
  ]);

  const [relationshipOptions, setRelationshipOptions] = useState<
    { code: string; relationName: string }[]
  >([]);


  const [loadingRelations, setLoadingRelations] = useState(false);

  const [reasonForChange, setReasonForChange] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);

  const [employeeName, setEmployeeName] = useState("");

  const [employeeNumber, setEmployeeNumber] = useState("");
  const [employeeGender, setEmployeeGender] = useState("");
  const [employeeJoiningDate, setEmployeeJoiningDate] = useState("");
  const [isMaritalStatusUpdated, setIsMaritalStatusUpdated] = useState(false);

  const [lastUpdatedOn, setLastUpdatedOn] = useState("");

  const [initialData, setInitialData] =
    useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const errorRef = useRef<HTMLDivElement | null>(null);
  const insuranceOptions = [
    { label: "Group Personal Accident", value: "GPA" },
    { label: "Group Term Life", value: "GTL" },
    { label: "Group Health Insurance", value: "INS" },
  ];

  const insuranceTermsByType: Record<string, string> = {
    GPA:
      "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the GPA (Group Personal Accident) Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",

    GTL:
      "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the GTL (Group Term Life) Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",

    INS:
      "I hereby declare that in the event of my death or permanent disability by way of accident or otherwise during the tenure of my service with Linde Global Support Services Pvt. Ltd., the following person(s) are entitled to receive the compensations paid by the company as my nominee(s) arising out of the insurance policies taken out by the Company under the Group Health Insurance Scheme. I also confirm that in case I wish to change the nominees, I shall submit an updated version for records and in the absence of an updated version of this signed document, the last updated signed version as available in HR records will be considered as final nomination in case of any eventuality.",
  };

  const selectedTerms = insuranceTermsByType[insuranceType];

  const isFormDisabled = insuranceType === "";

  const isHealthInsurance =
    insuranceType === "INS";
  const GHI_ERR_MESSAGE =
    "Kindly contact HR for any further assistance or refer to the HR policy for more details.";

  const totalPercentageShare =
    isHealthInsurance
      ? "N.A"
      : percentageShares.reduce(
        (sum, share) =>
          sum +
          (share.trim() === ""
            ? 0
            : Number(share)),
        0
      );
  const todayInputValue = new Date().toISOString().split("T")[0];

  const toDateInputValue = (value: string | null | undefined) => {
    const trimmed = String(value || "").trim();

    if (!trimmed) return "";

    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashMatch) return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;

    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const normalizeGender = (value: unknown) => {
    const normalized = String(value || "").trim().toLowerCase();

    if (normalized === "male" || normalized === "m") return "M";
    if (normalized === "female" || normalized === "f") return "F";

    return "";
  };

  const toBoolean = (value: unknown) => {
    if (typeof value === "boolean") return value;

    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
  };

  const getRelationOption = (code: string) =>
    relationshipOptions.find(
      (relation) =>
        relation.code.trim().toUpperCase() === code.trim().toUpperCase()
    );

  const getRelationText = (code: string) => {
    const option = getRelationOption(code);
    return `${code} ${option?.relationName || ""}`.trim().toLowerCase();
  };

  const getRelationCategory = (code: string) => {
    const relationText = getRelationText(code);
    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode === "CD" || relationText.includes("child")) return "child";
    if (["FAL", "MOL"].includes(normalizedCode) || relationText.includes("inlaw") || relationText.includes("in-law")) return "inlaw";
    if (normalizedCode === "FA" || relationText.includes("father")) return "father";
    if (normalizedCode === "MO" || relationText.includes("mother")) return "mother";
    if (relationText.includes("parent")) return "parent";
    if (relationText.includes("spouse") || relationText.includes("wife") || relationText.includes("husband")) return "spouse";

    return "";
  };

  const getAge = (date: Date) => {
    const todayDate = new Date();

    let age =
      todayDate.getFullYear() -
      date.getFullYear();

    const monthDifference =
      todayDate.getMonth() -
      date.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        todayDate.getDate() <
        date.getDate())
    ) {
      age--;
    }

    return age;
  };

  const hasCompletedOneYearOfService = () => {
    const joiningDate = parseDateOnly(toDateInputValue(employeeJoiningDate));

    if (!joiningDate) return false;

    const oneYearDate = new Date(joiningDate);
    oneYearDate.setFullYear(oneYearDate.getFullYear() + 1);

    return new Date() >= oneYearDate;
  };

  const findEmployeeRelationCode = (
    options: { code: string; relationName: string }[]
  ) => {
    const employeeRelation = options.find((relation) => {
      const relationText = `${relation.code} ${relation.relationName}`.toLowerCase();
      return relationText.includes("self") || relationText.includes("employee");
    });

    return employeeRelation?.code || "";
  };
  useEffect(() => {
    if (!successMessage) return;

    const timer = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        // Single Search flow
        if (
          state?.mode === "single-search" &&
          state?.empId
        ) {
          const profile =
            await getEmpProfileByEmpId(
              state.empId
            );

          const fetchedUserId =
            profile?.user_Id || "";

          setUserId(fetchedUserId);

          setEmployeeName(
            profile?.empName || ""
          );

          setEmployeeNumber(
            String(
              profile?.user_Employee_No || ""
            )
          );
          setEmployeeGender(normalizeGender(profile?.user_Sex));
          setEmployeeJoiningDate(toDateInputValue(profile?.user_Doj));
          setIsMaritalStatusUpdated(toBoolean(profile?.user_Mat_Pat_Applicable));
        }

        // Normal logged-in flow
        else {
          setUserId(loggedInUserId);

          const profile =
            await getEmpProfileByAdId(
              loggedInUserId
            );

          setEmployeeName(
            profile?.empName || ""
          );

          setEmployeeNumber(
            String(
              profile?.user_Employee_No || ""
            )
          );
          setEmployeeGender(normalizeGender(profile?.user_Sex));
          setEmployeeJoiningDate(toDateInputValue(profile?.user_Doj));
          setIsMaritalStatusUpdated(toBoolean(profile?.user_Mat_Pat_Applicable));
        }
      } catch (error) {
        console.error(
          "Failed to fetch employee details",
          error
        );

        setEmployeeName("");
        setEmployeeNumber("");
        setEmployeeGender("");
        setEmployeeJoiningDate("");
        setIsMaritalStatusUpdated(false);
      }
    };

    loadUserDetails();
  }, [state, loggedInUserId]);

  useEffect(() => {
    const fetchInsuranceData = async () => {
      if (!insuranceType || !userId) {
        setRelationshipOptions([]);
        return;
      }

      try {
        setLoadingRelations(true);

        const relationsPromise =
          getInsuranceRelations(insuranceType);

        const nominationPromise =
          getInsuranceNominationDetails(
            insuranceType,
            userId
          ).catch((error) => {
            if (
              error?.message === "No Data Found"
            ) {
              return {
                data: [],
                reasonforchange: "",
                lastupdateon: "",
                acceptterms: false,
              };
            }

            throw error;
          });

        const [relations, nominationDetails] =
          await Promise.all([
            relationsPromise,
            nominationPromise,
          ]);


        setRelationshipOptions(relations);



        setReasonForChange(
          nominationDetails.reasonforchange || ""
        );

        setLastUpdatedOn(
          nominationDetails.lastupdateon || ""
        );

        setAcceptTerms(
          nominationDetails.acceptterms || false
        );

        const nominees =
          nominationDetails.data || [];

        const updatedNames = ["", "", "", ""];
        const updatedDobs = ["", "", "", ""];
        const updatedRelationships = [
          "",
          "",
          "",
          "",
        ];
        const updatedShares = ["", "", "", ""];

        nominees.forEach((nominee, index) => {
          updatedNames[index] =
            nominee.mamberName || "";

          updatedRelationships[index] =
            nominee.relationCode || "";

          updatedShares[index] =
            nominee.percentageShare !== null &&
              nominee.percentageShare !== undefined
              ? nominee.percentageShare.toString()
              : "";

          if (nominee.memberDOB) {
            const dob = new Date(nominee.memberDOB);

            if (!isNaN(dob.getTime())) {
              const year = dob.getFullYear();
              const month = String(
                dob.getMonth() + 1
              ).padStart(2, "0");
              const day = String(
                dob.getDate()
              ).padStart(2, "0");

              updatedDobs[index] =
                `${year}-${month}-${day}`;
            }
          }
        });

        if (insuranceType === "INS") {
          const employeeRelationCode = findEmployeeRelationCode(relations);

          updatedNames[0] = employeeName;

          if (employeeRelationCode) {
            updatedRelationships[0] = employeeRelationCode;
          }
        }

        setNomineeNames(updatedNames);

        setNomineeDobs(updatedDobs);

        setRelationships(
          updatedRelationships
        );

        setPercentageShares(
          updatedShares
        );

        const originalData = JSON.stringify({
          nomineeNames: updatedNames,
          nomineeDobs: updatedDobs,
          relationships:
            updatedRelationships,
          percentageShares:
            updatedShares,
          reasonForChange:
            nominationDetails.reasonforchange ||
            "",
          acceptTerms:
            nominationDetails.acceptterms ||
            false,
        });

        setInitialData(originalData);
      } catch (error) {
        console.error(
          "Failed to load insurance data",
          error
        );
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchInsuranceData();
  }, [insuranceType, userId, employeeName]);

  const handlePrint = () => {
    window.print();
  };

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value
      .split("-")
      .map(Number);

    if (!year || !month || !day) {
      return null;
    }

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const formatDisplayDate = (value: string) => {
    if (!value) return "";

    const parts = value.split("-");

    if (parts.length !== 3) {
      return value;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");
    if (!reasonForChange.trim()) {
      setError("Reason For Change is mandatory");
      return;
    }

    if (!acceptTerms) {
      setError(
        "Please accept Terms & Condition before proceeding!"
      );
      return;
    }

    if (!employeeNumber) {
      setError("Employee number not loaded");
      return;
    }

    const currentData = JSON.stringify({
      nomineeNames,
      nomineeDobs,
      relationships,
      percentageShares,
      reasonForChange,
      acceptTerms,
    });

    if (currentData === initialData) {
      setError("No changes detected");
      return;
    }

    for (
      let index = 0;
      index < nomineeRows.length;
      index++
    ) {
      const nomineeName =
        nomineeNames[index].trim();

      const dobValue =
        nomineeDobs[index].trim();

      const relationship =
        relationships[index].trim();

      const shareValue =
        percentageShares[index].trim();

      const hasRowData = isHealthInsurance
        ? Boolean(
          nomineeName ||
          dobValue ||
          relationship
        )
        : Boolean(
          nomineeName ||
          dobValue ||
          relationship ||
          shareValue
        );

      const isMissingRequiredField =
        !nomineeName ||
        !dobValue ||
        !relationship ||
        (!isHealthInsurance &&
          !shareValue);

      if (
        hasRowData &&
        isMissingRequiredField
      ) {
        setError(
          `Please complete all mandatory fields for nominee row ${index + 1} before saving.`
        );
        return;
      }
    }

    const duplicateLimitedRelations = new Set<string>();
    const hasParent = relationships.some((relationship) =>
      ["father", "mother", "parent"].includes(getRelationCategory(relationship))
    );
    const hasInlaw = relationships.some((relationship) =>
      getRelationCategory(relationship) === "inlaw"
    );

    for (
      let index = 0;
      index < nomineeRows.length;
      index++
    ) {
      const relationship =
        relationships[index].trim();

      const dobValue =
        nomineeDobs[index].trim();

      const shareValue =
        percentageShares[index].trim();

      if (dobValue) {
        const dob =
          parseDateOnly(dobValue);

        if (!dob) {
          setError(`Please enter a valid DOB for nominee row ${index + 1}.`);
          return;
        }

        if (dob > new Date()) {
          setError(`Future dates are not allowed for DOB in nominee row ${index + 1}.`);
          return;
        }
      }

      if (
        shareValue &&
        !/^\d+(\.\d{1,2})?$/.test(shareValue)
      ) {
        setError(`Percentage Share for nominee row ${index + 1} can have only up to 2 digits after decimal point.`);
        return;
      }

      const relationCategory = getRelationCategory(relationship);

      if (
        ["father", "mother", "spouse"].includes(relationCategory)
      ) {
        if (duplicateLimitedRelations.has(relationCategory)) {
          setError("There can not be two mother/father/spouse of same employee.");
          return;
        }

        duplicateLimitedRelations.add(relationCategory);
      }
    }

    if (isHealthInsurance) {
      if (
        (hasParent || hasInlaw) &&
        !hasCompletedOneYearOfService()
      ) {
        setError("You can add your Parents or Inlaws as Dependant after one year of service." + GHI_ERR_MESSAGE);
        return;
      }

      if (employeeGender === "M" && hasInlaw) {
        setError("Male Employees cannot add Inlaws as Dependant." + GHI_ERR_MESSAGE);
        return;
      }

      if (employeeGender === "F" && hasParent && hasInlaw) {
        setError("Female Employees can add either parents or Inlaws as dependent." + GHI_ERR_MESSAGE);
        return;
      }

      if (employeeGender === "F" && hasInlaw && !isMaritalStatusUpdated) {
        setError("Female Employees cannot add Inlaws as dependent before updating the marital status. Contact HR to update your marital status.");
        return;
      }

      for (
        let index = 0;
        index < nomineeRows.length;
        index++
      ) {
        const relationship =
          relationships[index];

        const dobValue =
          nomineeDobs[index];

        if (!relationship || !dobValue) {
          continue;
        }

        const dob =
          parseDateOnly(dobValue);

        if (!dob) {
          continue;
        }

        const age = getAge(dob);
        const relationCategory = getRelationCategory(relationship);

        if (
          relationCategory === "child" &&
          age > 25
        ) {
          setError(
            "Maximum permissible age to add your Child as dependent is 25 years." + GHI_ERR_MESSAGE
          );

          return;
        }

        if (
          ["father", "mother", "parent", "inlaw"].includes(relationCategory) &&
          age > 100
        ) {
          setError(
            "Maximum permissible age to add your Parents or Inlaws as dependent is 100 years." + GHI_ERR_MESSAGE
          );

          return;
        }
      }
    }
    if (
      insuranceType === "GPA" ||
      insuranceType === "GTL"
    ) {
      const filledRows = nomineeRows.filter(
        (_, index) =>
          nomineeNames[index].trim() !== ""
      );

      for (const index of filledRows) {
        const share =
          Number(
            percentageShares[index - 1]
          ) || 0;

        if (share <= 0) {
          setError(
            `Percentage Share for nominee row ${index} must be greater than 0`
          );
          return;
        }
      }

      const totalShare =
        percentageShares.reduce(
          (sum, share) =>
            sum +
            (share.trim() === ""
              ? 0
              : Number(share)),
          0
        );

      if (totalShare !== 100) {
        setError(
          `Total Percentage Share for ${insuranceType} must be exactly 100`
        );
        return;
      }
    }
    await new Promise((resolve) =>
      setTimeout(resolve, 0)
    );

    try {
      const payload = nomineeRows
        .map((row, index) => ({
          sequence: row,

          memberDOB:
            nomineeDobs[index] || "",

          relationCode:
            relationships[index],

          mamberName:
            nomineeNames[index],

          insuranceType:
            insuranceType,

          percentageShare:
            isHealthInsurance
              ? 0
              : Number(
                percentageShares[
                index
                ] || 0
              ),
          updatedBy: user?.loginUserAdID || "",
          updatedOn: new Date().toISOString(),
        }))
        .filter(
          (item) =>
            item.mamberName.trim() !==
            ""
        );
      console.log("percentageShares", percentageShares);
      console.log("payload", payload);

      await manageInsuranceNominationDetails(
        reasonForChange,
        employeeNumber,
        userId,
        payload
      );

      setSuccessMessage(
        "Insurance nomination details saved successfully"
      );
      setError("");

      setInsuranceType("");

      setNomineeNames(["", "", "", ""]);
      setNomineeDobs(["", "", "", ""]);
      setRelationships(["", "", "", ""]);
      setPercentageShares(["", "", "", ""]);
      setReasonForChange("");
      setAcceptTerms(false);
      setLastUpdatedOn("");
      setInitialData("");
      setRelationshipOptions([]);



    } catch (error) {
      console.error(
        "Failed to save insurance details",
        error
      );

      setError(
        "Failed to save insurance details"
      );
    }
  };

  const handlePercentageShareChange = (
    index: number,
    value: string
  ) => {
    setError("");
    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    const nextShares =
      percentageShares.map(
        (share, shareIndex) =>
          shareIndex === index
            ? value
            : share
      );

    const nextTotal =
      nextShares.reduce(
        (sum, share) =>
          sum +
          (share.trim() === ""
            ? 0
            : Number(share)),
        0
      );

    if (nextTotal > 100) {
      return;
    }

    setPercentageShares(
      (currentShares) =>
        currentShares.map(
          (share, shareIndex) =>
            shareIndex === index
              ? value
              : share
        )
    );
  };

  const handleNomineeNameChange = (
    index: number,
    value: string
  ) => {
    setError("");

    setNomineeNames((currentNames) =>
      currentNames.map(
        (name, nameIndex) =>
          nameIndex === index
            ? value
            : name
      )
    );
  };

  const handleNomineeDobChange = (
    index: number,
    value: string
  ) => {
    setError("");
    setNomineeDobs((currentDobs) =>
      currentDobs.map(
        (dob, dobIndex) =>
          dobIndex === index
            ? value
            : dob
      )
    );
  };



  const handleRelationshipChange = (
    index: number,
    value: string
  ) => {
    setError("");
    setRelationships(
      (currentRelationships) =>
        currentRelationships.map(
          (
            relationship,
            relationshipIndex
          ) =>
            relationshipIndex ===
              index
              ? value
              : relationship
        )
    );
  };

  return (
    <section className="insurance-wrapper">
      <div className="insurance-card">
        <div className="insurance-title-band">
          <h2 className="form-title">
            Insurance Nomination Form -{" "}
            {employeeName}
            ({employeeNumber})
          </h2>
        </div>

        <div className="insurance-content">
          {error && (
            <div
              ref={errorRef}
              className="insurance-error-text"
            >
              {error}
            </div>
          )}

          <ToastMessage
            show={!!successMessage}
            message={successMessage}
            type="success"
          />
          <div className="insurance-type-row">
            <label htmlFor="insurance-type">
              Insurance Type:
            </label>

            <select
              id="insurance-type"
              value={insuranceType}
              onChange={(e) => {
                const value = e.target.value;

                setError("");
                setSuccessMessage("");

                setInsuranceType(value);

                if (value === "") {
                  setNomineeNames(["", "", "", ""]);
                  setNomineeDobs(["", "", "", ""]);
                  setRelationships(["", "", "", ""]);
                  setPercentageShares(["", "", "", ""]);
                  setReasonForChange("");
                  setAcceptTerms(false);
                  setLastUpdatedOn("");
                  setInitialData("");
                  setRelationshipOptions([]);
                }
              }}
            >
              <option value="">
                Please Select
              </option>

              {insuranceOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <table className="nominee-table">
            <thead>
              <tr>
                <th className="col-serial">
                  SlNo
                </th>

                <th className="col-name">
                  Name of the Nominees
                </th>

                <th className="col-dob">
                  DOB
                </th>

                <th className="col-type">
                  Type
                </th>

                <th className="col-relationship">
                  Relationship
                </th>

                <th className="col-share">
                  Percentage Share
                </th>
              </tr>
            </thead>

            <tbody>
              {nomineeRows.map(
                (row, index) => (
                  <tr key={row}>
                    <td className="serial-cell">
                      {row
                        .toString()
                        .padStart(
                          2,
                          "0"
                        )}
                      #
                    </td>

                    <td>
                      <input
                        type="text"
                        aria-label={`Nominee ${row} name`}
                        value={
                          nomineeNames[
                          index
                          ]
                        }
                        disabled={
                          isFormDisabled ||
                          (isHealthInsurance && index === 0)
                        }
                        onChange={(e) =>
                          handleNomineeNameChange(
                            index,
                            e.target.value
                          )
                        }
                      />
                    </td>


                    <td>
                      <div className="insurance-dob-wrapper">
                        <input
                          type="date"
                          className="insurance-dob-input"
                          aria-label={`Nominee ${row} date of birth`}
                          value={nomineeDobs[index]}
                          max={todayInputValue}
                          disabled={isFormDisabled}
                          onChange={(e) =>
                            handleNomineeDobChange(
                              index,
                              e.target.value
                            )
                          }
                        />

                        <span className="insurance-dob-text">
                          {nomineeDobs[index]
                            ? formatDisplayDate(
                              nomineeDobs[index]
                            )
                            : "dd/mm/yyyy"}
                        </span>
                      </div>

                    </td>

                    <td>
                      <input
                        type="text"
                        aria-label={`Nominee ${row} type`}
                        value={
                          insuranceType ===
                            "INS"
                            ? "GHI"
                            : insuranceType
                        }
                        disabled
                        readOnly
                      />
                    </td>

                    <td>
                      <select
                        aria-label={`Nominee ${row} relationship`}
                        value={
                          relationships[
                          index
                          ]
                        }
                        disabled={
                          isFormDisabled ||
                          loadingRelations ||
                          (isHealthInsurance && index === 0)
                        }
                        onChange={(e) =>
                          handleRelationshipChange(
                            index,
                            e.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          ---SELECT---
                        </option>

                        {relationshipOptions.map(
                          (
                            relation
                          ) => (
                            <option
                              key={
                                relation.code
                              }
                              value={
                                relation.code
                              }
                            >
                              {
                                relation.relationName
                              }
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td>
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Nominee ${row} percentage share`}
                        value={
                          isHealthInsurance
                            ? "N.A"
                            : percentageShares[
                            index
                            ]
                        }
                        disabled={
                          isFormDisabled
                        }
                        readOnly={
                          isHealthInsurance
                        }
                        onChange={(e) =>
                          handlePercentageShareChange(
                            index,
                            e.target
                              .value
                          )
                        }
                        className={`share-input ${isHealthInsurance
                          ? "na-share-input"
                          : ""
                          }`}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>

            <tfoot>
              <tr className="nominee-total-row">
                <td
                  colSpan={5}
                  className="nominee-total-label"
                >
                  Total Percentage
                  Share
                </td>

                <td className="nominee-total-value">
                  {
                    totalPercentageShare
                  }
                </td>
              </tr>
            </tfoot>
          </table>

          {isHealthInsurance && (
            <div className="ghi-note">
              <strong>
                Note : The Group
                Health Insurance
                policy offers a
                coverage limit of
                INR 5 lakh per
                policy cycle.
              </strong>
            </div>
          )}

          {selectedTerms && (
            <div className="insurance-terms">
              <span className="insurance-terms-label">
                Terms:
              </span>{" "}
              <span>
                {selectedTerms}
              </span>
            </div>
          )}

          <div className="bottom-section">
            <div className="footer-field reason-field">
              <label htmlFor="reason-for-change">
                Reason For Change:{" "}
                <span className="required-asterisk">
                  *
                </span>
              </label>

              <input
                id="reason-for-change"
                type="text"
                value={
                  reasonForChange
                }
                disabled={
                  isFormDisabled
                }
                onChange={(e) => {
                  setError("");
                  setReasonForChange(e.target.value);
                }}
              />
            </div>

            <div className="footer-field updated-field">
              <label>
                Last Updated On:
              </label>

              <span className="updated-value">
                {lastUpdatedOn}
              </span>
            </div>

            <div className="footer-field terms-field">
              <label htmlFor="accept-terms">
                Accept Terms:
              </label>

              <input
                id="accept-terms"
                type="checkbox"
                checked={
                  acceptTerms
                }
                disabled={
                  isFormDisabled
                }
                onChange={(e) => {
                  setError("");
                  setAcceptTerms(e.target.checked);
                }}
              />
            </div>

            <div className="buttons">
              <button
                className="save"
                type="button"
                onClick={
                  handleSave
                }
                disabled={
                  isFormDisabled
                }
              >
                Save
              </button>

              <button
                className="print"
                type="button"
                onClick={
                  handlePrint
                }
                disabled={
                  isFormDisabled
                }
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
