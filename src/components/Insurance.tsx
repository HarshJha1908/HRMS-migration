import { useEffect, useState } from "react";
import "./Insurance.css";

import {
  getInsuranceRelations,
  getInsuranceNominationDetails,
  manageInsuranceNominationDetails,
  getEmpProfileByAdId,
} from "../services/apiService";

import { useAuth } from "../auth/useAuth";

const Insurance = () => {
  const { user } = useAuth();

  const userId = user?.loginUserAdID || "";

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

  const [dobInputTypes, setDobInputTypes] = useState([
    "text",
    "text",
    "text",
    "text",
  ]);

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

  const [lastUpdatedOn, setLastUpdatedOn] = useState("");

  const [initialData, setInitialData] =
    useState("");

  const today = new Date().toISOString().split("T")[0];

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

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!userId) {
        setEmployeeNumber("");
        return;
      }

      try {
        const empProfile =
          await getEmpProfileByAdId(
            userId
          );

        setEmployeeNumber(
          String(
            empProfile?.user_Employee_No ||
              ""
          )
        );
      } catch (error) {
        console.error(
          "Failed to load employee profile",
          error
        );
        setEmployeeNumber("");
      }
    };

    fetchEmployeeProfile();
  }, [userId]);

  useEffect(() => {
    const fetchInsuranceData = async () => {
      if (!insuranceType || !userId) {
        setRelationshipOptions([]);
        return;
      }

      try {
        setLoadingRelations(true);

        const [relations, nominationDetails] =
          await Promise.all([
            getInsuranceRelations(
              insuranceType
            ),
            getInsuranceNominationDetails(
              insuranceType,
              userId
            ),
          ]);

        setRelationshipOptions(relations);

        setEmployeeName(
          nominationDetails.employeeName || ""
        );

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
            const dob = new Date(
              nominee.memberDOB
            );

            if (!isNaN(dob.getTime())) {
              updatedDobs[index] = dob
                .toISOString()
                .split("T")[0];
            }
          }
        });

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
  }, [insuranceType, userId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!reasonForChange.trim()) {
  window.alert(
    "Reason For Change is mandatory"
  );
  return;
}

if (!acceptTerms) {
  window.alert(
    "Please accept Terms & Condition before proceeding!"
  );
  return;
}

    if (!employeeNumber) {
      window.alert(
        "Employee number not loaded"
      );
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
      window.alert(
        "No changes detected"
      );
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
        window.alert(
          `Please complete all mandatory fields for nominee row ${
            index + 1
          } before saving.`
        );
        return;
      }
    }

    if (isHealthInsurance) {
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

        const dob = new Date(dobValue);

        if (isNaN(dob.getTime())) {
          continue;
        }

        const todayDate = new Date();

        let age =
          todayDate.getFullYear() -
          dob.getFullYear();

        const monthDifference =
          todayDate.getMonth() -
          dob.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 &&
            todayDate.getDate() <
              dob.getDate())
        ) {
          age--;
        }

        if (
          relationship === "CD" &&
          age > 18
        ) {
          window.alert(
            "Maximum permissible age to add your Child as dependent is 18 years. Please check the DOB of your dependents. Kindly refer Group Health Insurance policy or contact HR."
          );

          return;
        }

        if (
          [
            "FA",
            "MO",
            "FAL",
            "MOL",
          ].includes(relationship) &&
          age > 85
        ) {
          window.alert(
            "Maximum permissible age to add your Parents or Inlaws as dependent is 85 years. Please check the DOB of your dependents. Kindly refer Group Health Insurance policy or contact HR."
          );

          return;
        }
      }
    }

    try {
      const payload = nomineeRows
        .map((row, index) => ({
          sequence: row,

          memberDOB: nomineeDobs[index]
            ? new Date(
                nomineeDobs[index]
              ).toISOString()
            : "",

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
        }))
        .filter(
          (item) =>
            item.mamberName.trim() !==
            ""
        );

      await manageInsuranceNominationDetails(
        reasonForChange,
        employeeNumber,
        userId,
        payload
      );

      window.alert(
        "Insurance nomination details saved successfully"
      );

      const nominationDetails =
        await getInsuranceNominationDetails(
          insuranceType,
          userId
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
          const dob = new Date(
            nominee.memberDOB
          );

          if (!isNaN(dob.getTime())) {
            updatedDobs[index] = dob
              .toISOString()
              .split("T")[0];
          }
        }
      });

      setNomineeNames(updatedNames);

      setNomineeDobs(updatedDobs);

      setRelationships(
        updatedRelationships
      );

      setPercentageShares(
        updatedShares
      );

      const latestData = JSON.stringify({
        nomineeNames: updatedNames,
        nomineeDobs: updatedDobs,
        relationships:
          updatedRelationships,
        percentageShares:
          updatedShares,
        reasonForChange,
        acceptTerms,
      });

      setInitialData(latestData);
    } catch (error) {
      console.error(
        "Failed to save insurance details",
        error
      );

      window.alert(
        "Failed to save insurance details"
      );
    }
  };

  const handlePercentageShareChange = (
    index: number,
    value: string
  ) => {
    if (!/^\d*$/.test(value)) {
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
    setNomineeDobs((currentDobs) =>
      currentDobs.map(
        (dob, dobIndex) =>
          dobIndex === index
            ? value
            : dob
      )
    );
  };

  const handleDobFocus = (
    index: number
  ) => {
    setDobInputTypes(
      (currentTypes) =>
        currentTypes.map(
          (type, typeIndex) =>
            typeIndex === index
              ? "date"
              : type
        )
    );
  };

  const handleDobBlur = (
    index: number
  ) => {
    if (nomineeDobs[index]) {
      return;
    }

    setDobInputTypes(
      (currentTypes) =>
        currentTypes.map(
          (type, typeIndex) =>
            typeIndex === index
              ? "text"
              : type
        )
    );
  };

  const handleRelationshipChange = (
    index: number,
    value: string
  ) => {
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
            {employeeName || user?.name || ""}
            ({employeeNumber})
          </h2>
        </div>

        <div className="insurance-content">
          <div className="insurance-type-row">
            <label htmlFor="insurance-type">
              Insurance Type:
            </label>

            <select
              id="insurance-type"
              value={insuranceType}
              onChange={(e) =>
                setInsuranceType(
                  e.target.value
                )
              }
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
                  DOB (dd/mm/yyyy)
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
                          isFormDisabled
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
                      <input
                        type={
                          dobInputTypes[
                            index
                          ]
                        }
                        aria-label={`Nominee ${row} date of birth`}
                        value={
                          nomineeDobs[
                            index
                          ]
                        }
                        max={today}
                        disabled={
                          isFormDisabled
                        }
                        onFocus={() =>
                          handleDobFocus(
                            index
                          )
                        }
                        onBlur={() =>
                          handleDobBlur(
                            index
                          )
                        }
                        onChange={(e) =>
                          handleNomineeDobChange(
                            index,
                            e.target.value
                          )
                        }
                      />
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
                          loadingRelations
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
                        inputMode="numeric"
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
                        className={`share-input ${
                          isHealthInsurance
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
                onChange={(e) =>
                  setReasonForChange(
                    e.target.value
                  )
                }
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
                onChange={(e) =>
                  setAcceptTerms(
                    e.target.checked
                  )
                }
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