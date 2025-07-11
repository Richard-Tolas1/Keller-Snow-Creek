import React, { useEffect, useState } from "react";
import SingleApplication from "./SingleApplication";
import styles from "./Applications.module.css";
import { Button } from "./ui/Button/Button";
import { ApplicationData } from "./types/applicationData";

const Applications = () => {
  const [applicationData, setApplicationData] = useState<ApplicationData[]>([]);
  const [offset, setOffset] = useState(0);
  async function getData() {
    const url = `http://localhost:3001/api/applications?_page=${offset}&_limit=5`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {

    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await getData();
      if (data) {
        setApplicationData((prevData) => [...(prevData || []), ...data]);
      }
    };
    fetchData();
  }, [offset]);

  return (
    <div>
      <div className={styles.Applications}>
        {applicationData?.map((application) => (
          <SingleApplication application={application} />
        ))}
      </div>
      <div className="button">
        <Button
          className={""}
          onClick={() => {
            setOffset((prevOffset) => prevOffset + 1);
          }}>
          Load More
        </Button>
      </div>
    </div>
  );
};

export default Applications;
