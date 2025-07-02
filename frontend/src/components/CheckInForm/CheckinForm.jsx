import { useReducer, useEffect } from "react";
import styles from "./CheckInForm.module.css";
import { useNavigate } from "react-router-dom";
import { getMinDate, getDaysBetween } from "../helperFunctions";
import { fetchAvailableSlots } from "../../api/api";
import { formReducer, initialState } from "../../store/form_reducer";

export default function CheckInForm() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(formReducer, initialState);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) {
      alert("Please login to continue");
      navigate("/");
    }
  }, [navigate]);

  const handleCheckSlots = async (e) => {
    e.preventDefault();

    const today = new Date();
    const start = new Date(state.startDate);
    const end = new Date(state.endDate);
    const days = getDaysBetween(state.startDate, state.endDate);

    if (start <= today) {
      alert("Booking must start from tomorrow or later.");
      return;
    }

    if (end < start) {
      alert("End date must be after start date.");
      return;
    }

    if (days > 3) {
      alert("You can book for a maximum of 3 days.");
      return;
    }

    const availableSlots = await fetchAvailableSlots(state);

    if (!availableSlots || availableSlots.length === 0) {
      alert("No slots available for the selected criteria.");
      return;
    }

    localStorage.setItem("availableSlots", JSON.stringify(availableSlots));
    localStorage.setItem("formState", JSON.stringify(state));

    navigate("/temporary");
  };

  return (
    <div className={styles.main_container}>
      <div className={styles.container}>
        <form onSubmit={handleCheckSlots} className={styles.form_content}>
          <div className={styles.date_wrapper}>
            <label className={styles.label}>Check In</label>
            <input
              className={styles.input}
              type="date"
              required
              min={getMinDate(1)}
              value={state.startDate || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "startDate",
                  value: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.date_wrapper}>
            <label className={styles.label}>Check Out</label>
            <input
              className={styles.input}
              type="date"
              required
              min={getMinDate(1)}
              value={state.endDate || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "endDate",
                  value: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.date_wrapper}>
            <label className={styles.label}>Vehicle Type</label>
            <select
              className={styles.input}
              required
              value={state.vehicleType || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "vehicleType",
                  value: e.target.value,
                })
              }
            >
              <option value="">-- Select Vehicle Type --</option>
              <option value="2-wheeler">2-wheeler</option>
              <option value="4-wheeler">4-wheeler</option>
            </select>
          </div>

          <div className={styles.date_wrapper}>
            <label className={styles.label}>Vehicle Number</label>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g., KL07AB1234"
              value={state.vehicleNumber || ""}
              onChange={(e) =>
                dispatch({
                  type: "SET_FIELD",
                  field: "vehicleNumber",
                  value: e.target.value,
                })
              }
              required
            />
          </div>

          <button type="submit" className={styles.book_now}>
            Check Available Slots
          </button>
        </form>
      </div>
    </div>
  );
}
