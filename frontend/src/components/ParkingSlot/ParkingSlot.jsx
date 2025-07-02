import styles from "./ParkingSlot.module.css";
import { createBooking } from "../../api/api";

export default function ParkingSlotSelector({
  slots,
  formState,
  onBookSuccess,
}) {
  if (slots.length === 0) {
    return <p className={styles.no_slots}>No slots available</p>;
  }

  const handleBookSlot = async (slot) => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    const payload = {
      userId: user.id,
      slotId: slot.slotId,
      startDate: formState.startDate,
      endDate: formState.endDate,
      vehicleType: slot.vehicleType,
      vehicleNumber: formState.vehicleNumber,
    };

    try {
      const createdBooking = await createBooking(payload);

      const bookingWithDetails = {
        ...createdBooking,
        floorNo: slot.floorNo,
        location: slot.location,
      };

      onBookSuccess(bookingWithDetails);
    } catch (err) {
      alert(err.message || "Booking failed");
    }
  };

  return (
    <div className={styles.slot_list}>
      {slots.map((slot) => (
        <div key={`${slot.slotId}-${slot.date}`} className={styles.slot_card}>
          <p>
            <strong>Slot:</strong> {slot.slotId}
          </p>
          <p>
            <strong>Floor:</strong> {slot.floorNo}
          </p>
          <p>
            <strong>Type:</strong> {slot.vehicleType}
          </p>
          <p>
            <strong>Location:</strong> {slot.location}
          </p>

          <button
            className={styles.book_now}
            onClick={() => handleBookSlot(slot)}
          >
            Book This Slot
          </button>
        </div>
      ))}
    </div>
  );
}
