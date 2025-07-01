import { useEffect, useState } from "react";
import ReleaseSlot from "./ReleaseSlot";
import styles from "./PermanentUser.module.css";

export default function CancelRelease() {
  const [release, setRelease] = useState([]);
  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    const fetchRelease = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/release/${user.id}`);
        const data = await res.json();
        setRelease(data);
        console.log(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRelease();
  }, [user.id]);

  const handleClick = async (userId) => {
    const res = await fetch(`http://localhost:3001/api/release/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setRelease(release.filter((rel) => rel.userId !== userId));
      alert("Release cancelled. Your slot is reclaimed.");
    } else {
      alert("Failed to cancel the release.");
    }
  };

  return (
    <>
      {release.length === 0 ? (
        <ReleaseSlot />
      ) : (
        release.map((rel) => (
          <div key={rel.id} className={styles.release_container}>
            <h1 className={styles.release_title}>
              {user.username}, Your released Slot
            </h1>
            <p className={styles.text_item}> Slot Id: {rel.slotId}</p>
            <p className={styles.text_item}>Released From: {rel.fromDate}</p>
            <p className={styles.text_item}>Released To: {rel.toDate}</p>
            <button
              className={styles.button}
              onClick={() => handleClick(rel.userId)}
            >
              Cancel Release
            </button>
          </div>
        ))
      )}
    </>
  );
}
