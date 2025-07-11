import React from "react";
import styles from "./SingleApplication.module.css";

const SingleApplication = ({ application }) => {
  const formatDate = (rawdate) => {
    const date = new Date(rawdate);
    return date
      .toLocaleDateString("en-UK", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
  };
  return (
    <div className={styles.SingleApplication}>
      <div className={styles.cell}>
        <sub>Company</sub>
        <div>{application.company}</div>
      </div>
      <div className={styles.cell}>
        <sub>Name</sub>
        <div>
          {application.first_name} {application.last_name}
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Email</sub>
        <div>{application.email}</div>
      </div>
      <div className={styles.cell}>
        <sub>Loan Amount</sub>
        <div>£{application.loan_amount.toLocaleString("en-UK")}</div>
      </div>
      <div className={styles.cell}>
        <sub>Application Date</sub>
        {formatDate(application.date_created)}
      </div>
      <div className={styles.cell}>
        <sub>Expiry date</sub>
        {formatDate(application.expiry_date)}
      </div>
    </div>
  );
};

export default SingleApplication;
