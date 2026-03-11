import "./Insurance.css";

const Insurance = () => {
  const nomineeRows = [1, 2, 3, 4];

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
            <select id="insurance-type" defaultValue="Please Select">
              <option>Please Select</option>
              <option>Group Personal Accident</option>
              <option>Group Term Life</option>
              <option>Group Health Insurance</option>
            </select>
          </div>

          <table className="nominee-table">
            <thead>
              <tr>
                <th className="col-serial">SlNo</th>
                <th className="col-name">Name of the Nominees</th>
                <th className="col-type">Type</th>
                <th className="col-relationship">Relationship</th>
                <th className="col-share">Percentage Share</th>
              </tr>
            </thead>

            <tbody>
              {nomineeRows.map((row) => (
                <tr key={row}>
                  <td className="serial-cell">{row.toString().padStart(2, "0")}#</td>

                  <td>
                    <input type="text" aria-label={`Nominee ${row} name`} />
                  </td>

                  <td>
                    <input type="text" aria-label={`Nominee ${row} type`} />
                  </td>

                  <td>
                    <select aria-label={`Nominee ${row} relationship`} defaultValue="">
                      <option value=""></option>
                      <option>Father</option>
                      <option>Mother</option>
                      <option>Spouse</option>
                      <option>Child</option>
                    </select>
                  </td>

                  <td>
                    <input type="number" aria-label={`Nominee ${row} percentage share`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bottom-section">
            <div className="footer-field reason-field">
              <label htmlFor="reason-for-change">Reason For Change:</label>
              <input id="reason-for-change" type="text" />
            </div>

            <div className="footer-field updated-field">
              <label>Last Updated On:</label>
              <span className="updated-value"></span>
            </div>

            <div className="footer-field terms-field">
              <label htmlFor="accept-terms">Accept Terms:</label>
              <input id="accept-terms" type="checkbox" />
            </div>

            <div className="buttons">
              <button className="save" type="button">Save</button>
              <button className="print" type="button">Print</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Insurance;
