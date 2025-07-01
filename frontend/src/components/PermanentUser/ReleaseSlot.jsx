import { useState } from "react";
import styles from "./PermanentUser.module.css";
import { useDispatch, useSelector } from "react-redux";
import { setBookingInfo } from "../../store/userSlice";
import { useEffect } from "react";

export default function ReleaseSlot({ onRelease }) {
  const dispatch = useDispatch();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { bookingInfo } = useSelector((state) => state.user);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  console.log(user);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/bookings/${user.id}`
        );
        const data = await res.json();
        console.log("Fetched booking data:", data);
        dispatch(setBookingInfo(data));
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    if (user?.id && !bookingInfo) {
      fetchBooking();
    }
  }, [user?.id, bookingInfo, dispatch]);
  const slotId = bookingInfo?.[0]?.slotId;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      userId: user.id,
      slotId,
      fromDate,
      toDate,
    };

    const res = await fetch("http://localhost:3001/api/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    const result = await res.json();
    console.log("response:", result);
    if (onRelease) onRelease();
  };
  return (
    <form className={styles.form_container} onSubmit={handleSubmit}>
      <h1 className={styles.release_title}>Hello, {user.username}</h1>
      {bookingInfo ? (
        <p className={styles.text_item}>
          You can release your permanent slot: {slotId}
        </p>
      ) : (
        <p className={styles.text_item}>Loading booking info...</p>
      )}
      <div>
        <label className={styles.text_item}>Enter your start date: </label>
        <input
          className={styles.input}
          type="date"
          onChange={(e) => setFromDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label className={styles.text_item}> Enter your end date: </label>
        <input
          className={styles.input}
          type="date"
          onChange={(e) => setToDate(e.target.value)}
          required
        />
      </div>
      <button className={styles.button}>Release Slot</button>
    </form>
  );
}
