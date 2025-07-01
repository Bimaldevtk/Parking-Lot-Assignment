export const fetchAvailableSlots = async (formState) => {
  const { startDate, endDate, vehicleType } = formState;

  try {
    const res = await fetch(
      `http://localhost:3001/api/bookings/available?startDate=${startDate}&endDate=${endDate}&vehicleType=${vehicleType}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching slots:", error);
    return [];
  }
};

export const createBooking = async (payload) => {
  const res = await fetch("http://localhost:3001/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Booking failed");
  }

  const data = await res.json();
  return data.bookings?.[0]; // return the first new booking with ID
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
