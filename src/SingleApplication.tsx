import React from "react";
import styles from "./SingleApplication.module.css";

const SingleApplication = ({ application }) => {
  const formatDate = (rawdate) => {
    const date = new Date(rawdate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  return (
    <div className={styles.SingleApplication}>
      <div className={styles.cell}>
        <sub>Company</sub>
        <div className={styles.cellContent}>{application.company}</div>
      </div>
      <div className={styles.cell}>
        <sub>Name</sub>
        <div className={styles.cellContent}>
          {application.first_name} {application.last_name}
        </div>
      </div>
      <div className={styles.cell}>
        <sub>Email</sub>
        <div className={`${styles.cellContent} ${styles.cellContentEmail}`}>{application.email}</div>
      </div>
      <div className={styles.cell}>
        <sub>Loan Amount</sub>
        <div className={styles.cellContent}>£{application.loan_amount.toLocaleString("en-UK")}</div>
      </div>
      <div className={styles.cell}>
        <sub>Application Date</sub>
        <div className={styles.cellContent}>{formatDate(application.date_created)}</div>
      </div>
      <div className={styles.cell}>
        <sub>Expiry date</sub>
        <div className={styles.cellContent}>{formatDate(application.expiry_date)}</div>
      </div>
    </div>
  );
};

export default SingleApplication;
