import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ParkingSlotSelector from "../../components/ParkingSlot/ParkingSlot";
import styles from "./TemporaryPage.module.css";

export default function TemporaryPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [formState, setFormState] = useState(null);

  useEffect(() => {
    const available = JSON.parse(localStorage.getItem("availableSlots"));
    const form = JSON.parse(localStorage.getItem("formState"));

    if (!available || !Array.isArray(available) || !form) {
      alert("No slots or form data found");
      navigate("/home");
    } else {
      setSlots(available);
      setFormState(form);
    }
  }, [navigate]);

  const handleSuccess = (booking) => {
    localStorage.setItem("bookingInfo", JSON.stringify(booking));
    navigate("/booked");
  };

  return (
    <div className={styles.wrapper}>
      <h2>Available Slots</h2>
      <ParkingSlotSelector
        slots={slots}
        formState={formState}
        onBookSuccess={handleSuccess}
      />
    </div>
  );
}
