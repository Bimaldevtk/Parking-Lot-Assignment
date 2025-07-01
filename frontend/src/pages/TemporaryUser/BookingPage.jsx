import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./BookingPage.module.css";
import { cancelBooking } from "../../api/api";

export default function BookedPage() {
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const bookingInfo = JSON.parse(localStorage.getItem("bookingInfo"));
    if (!bookingInfo) {
      alert("No booking found");
      navigate("/");
    } else {
      setBooking(bookingInfo);
    }
  }, []);

  const handleCancel = async () => {
    if (!booking?.id) {
      alert("Cannot cancel booking: Booking ID not found");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirm) return;

    try {
      await cancelBooking(booking.id);
      alert("Booking cancelled successfully");
      localStorage.removeItem("bookingInfo");
      navigate("/my-bookings");
    } catch (error) {
      alert("Failed to cancel booking: " + error.message);
    }
  };

  if (!booking) return null;

  return (
    <div className={styles.wrapper}>
      <h2>🎉 Booking Confirmed!</h2>
      <div className={styles.card}>
        <p>
          <strong>Slot:</strong> {booking.slotId}
        </p>
        <p>
          <strong>Floor:</strong> {booking.floorNo}
        </p>
        <p>
          <strong>Location:</strong> {booking.location}
        </p>
        <p>
          <strong>Vehicle:</strong> {booking.vehicleType}
        </p>
        <p>
          <strong>Vehicle No:</strong> {booking.vehicleNumber}
        </p>
        <p>
          <strong>Start:</strong> {booking.startDate}
        </p>
        <p>
          <strong>End:</strong> {booking.endDate}
        </p>
      </div>

      {/* ✅ Cancel My Booking Button */}
      <button className={styles.cancel} onClick={handleCancel}>
        Cancel My Booking
      </button>
    </div>
  );
}
