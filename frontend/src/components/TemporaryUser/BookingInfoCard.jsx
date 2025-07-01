import { useState, useEffect } from "react";
import styles from "./BookingInfoCard.module.css";
import { fetchBooking } from "../../api/api";
import { cancelBooking } from "../../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/NavBar";

export default function BookingInfoCard() {
  const [bookingInfo, setBookingInfo] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBooking = async () => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (userInfo?.id) {
        const data = await fetchBooking(userInfo.id);
        if (data) setBookingInfo(data);
      }
    };

    loadBooking();
  }, []);

  const handleClick = async () => {
    const confirm = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirm) return;
    console.log(bookingInfo);
    const [booking] = bookingInfo;

    try {
      const result = await cancelBooking(booking.id);
      alert(result.message);
      setBookingInfo([]);
      navigate("/");
    } catch (error) {
      alert("Failed to cancel booking: " + error.message);
    }
  };

  useEffect(() => {
    if (bookingInfo.length === 0) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [bookingInfo, navigate]);

  if (bookingInfo.length === 0) {
    return (
      <div>
        <p>No booking found.</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  const [booking] = bookingInfo;

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Your Current Booking</h2>

          <div className={styles.detailsGrid}>
            <div className={styles.row_item}>
              <div className={styles.label}>Vehicle Type:</div>
              <div>{booking.vehicleType}</div>
            </div>
            <div className={styles.row_item}>
              <div className={styles.label}>Slot ID:</div>
              <div>{booking.slotId}</div>
            </div>
            <div className={styles.row_item}>
              <div className={styles.label}>Start Date:</div>
              <div>{booking.startDate}</div>
            </div>
            <div className={styles.row_item}>
              <div className={styles.label}>End Date:</div>
              <div>{booking.endDate}</div>
            </div>
            <div className={styles.row_item}>
              <button onClick={handleClick} className={styles.cancelButton}>
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
