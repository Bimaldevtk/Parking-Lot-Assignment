export const fetchAvailableSlots = async (state, dispatch) => {
  try {
    const res = await fetch("http://localhost:3001/api/bookings/available");
    const data = await res.json();

    const allDates = [];
    let curr = new Date(state.startDate);

    while (curr <= new Date(state.endDate)) {
      allDates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    const slotMap = {};

    data.forEach((slot) => {
      if (!slotMap[slot.slotId]) {
        slotMap[slot.slotId] = { ...slot, availableDates: [slot.date] };
      } else {
        slotMap[slot.slotId].availableDates.push(slot.date);
      }
    });

    const matchedSlots = Object.values(slotMap).filter((slot) =>
      allDates.every((d) => slot.availableDates.includes(d))
    );

    dispatch({ type: "SET_AVAILABLE_SLOTS", payload: matchedSlots });
  } catch (err) {
    console.error("Failed to fetch available slots:", err);
  }
};

export const createBooking = async (bookingPayload, navigate) => {
  try {
    const res = await fetch("http://localhost:3001/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingPayload),
    });

    const result = await res.json();

    if (res.ok) {
      alert(result.message || "Booking successful!");
      navigate("/booked");
    } else {
      alert(result.error || "Booking failed.");
    }
  } catch (err) {
    console.error("Booking error:", err);
  }
};

export const fetchBooking = async (userId) => {
  try {
    const res = await fetch(`http://localhost:3001/api/bookings/${userId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch booking", console.log(error));
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const res = await fetch(`http://localhost:3001/api/bookings/${bookingId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to cancel booking");
    }

    const data = await res.json();
    return data; // Success message or updated list
  } catch (err) {
    console.error("Error cancelling booking:", err.message);
    throw err;
  }
};
