import { useReducer, useEffect } from "react";
import styles from "./CheckInForm.module.css";
import { useNavigate } from "react-router-dom";
import { formReducer, initialState } from "../../store/form_reducer";
import { getMinDate } from "../helperFunctions";
import { getDaysBetween } from "../helperFunctions";
import { createBooking, fetchAvailableSlots } from "../../api/api";

export default function CheckInForm() {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(formReducer, initialState);
  const user = JSON.parse(localStorage.getItem("userInfo"));
  useEffect(() => {
    if (state.startDate && state.endDate) {
      fetchAvailableSlots(state, dispatch);
    }
  }, [state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please login");
      navigate("/login");
      return;
    }

    const today = new Date();
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);

    if (start <= today) {
      alert("Booking must start from tomorrow or later.");
      return;
    }

    if (end < start) {
      alert("End date must be after start date.");
      return;
    }

    const days = getDaysBetween(state.startDate, state.endDate);
    if (days > 3) {
      alert("You can book for a maximum of 3 days.");
      return;
    }

    if (!state.selectedSlotId) {
      alert("Slot is not available.");
      return;
    }

    const bookingDates = [];
    let curr = new Date(state.startDate);
    while (curr <= end) {
      bookingDates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const selectedSlot = state.availableSlots.find(
      (slot) => slot.slotId == state.selectedSlotId
    );

    console.log(selectedSlot);

    if (!selectedSlot) {
      alert("Selected slot not found.");
      return;
    }

    const bookingPayload = {
      userId: user.id,
      slotId: state.selectedSlotId,
      startDate: state.startDate,
      endDate: state.endDate,
      vehicleType: selectedSlot.vehicleType,
    };
    createBooking(bookingPayload, navigate);
    localStorage.setItem("bookingInfo", JSON.stringify(bookingPayload));
  };

  return (
    <div className={styles.main_container}>
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form_content}>
          <div className={styles.date_wrapper}>
            <label className={styles.label}>Check In</label>
            <input
              className={styles.input}
              type="date"
              required
              min={getMinDate(1)}
              value={state.startDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "startDate",
                  value: e.target.value,
                })
              }
            />
          </div>
          <div>
            <label className={styles.label}>Check Out</label>
            <input
              placeholder="Select Date"
              className={styles.input}
              type="date"
              min={getMinDate(1)}
              value={state.endDate}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "endDate",
                  value: e.target.value,
                })
              }
              required
            />
          </div>
          <div>
            <label className={styles.select_slot}>Select Slot</label>
            <select
              className={styles.input}
              value={state.selectedSlotId}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "selectedSlotId",
                  value: e.target.value,
                })
              }
              required
              disabled={state.availableSlots.length === 0}
            >
              <option value="">
                {state.availableSlots.length === 0
                  ? "Check Slot"
                  : "-- Choose a slot --"}
              </option>
              {state.availableSlots.map((slot) => (
                <option key={slot.slotId} value={slot.slotId}>
                  Slot no :{slot.slotId} - {slot.vehicleType}
                </option>
              ))}
            </select>
          </div>

          <button className={styles.book_now}>Book Now</button>
        </form>
      </div>
    </div>
  );
}
