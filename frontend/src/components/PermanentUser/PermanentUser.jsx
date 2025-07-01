import { useEffect, useState } from "react";
import CancelRelease from "./CancelRelease";
import styles from "./PermanentUser.module.css";
import ReleaseSlot from "./ReleaseSlot";
import Navbar from "../Navbar/NavBar";

export default function PermanentUser() {
  const [hasRelease, setHasRelease] = useState(false);
  const user = JSON.parse(localStorage.getItem("userInfo"));

  const fetchReleaseStatus = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/release/${user.id}`);
      const data = await res.json();
      setHasRelease(data.length > 0);
    } catch (err) {
      console.log("Failed to fetch release info", err);
    }
  };

  useEffect(() => {
    fetchReleaseStatus();
  });

  const handleRelease = () => {
    fetchReleaseStatus();
  };

  return (
    <>
      <div className={styles.container}>
        <Navbar />
        <div className={styles.sub_container}>
          {hasRelease ? (
            <CancelRelease />
          ) : (
            <ReleaseSlot onRelease={handleRelease} />
          )}
        </div>
      </div>
    </>
  );
}
