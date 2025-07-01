// Bookings APIs

import express from "express";
import fs from "node:fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await fs.readFile("./data/bookings.json");
  const bookings = JSON.parse(data);
  res.json(bookings);
});

router.get("/available", async (req, res) => {
  try {
    const { startDate, endDate, vehicleType } = req.query;

    if (!startDate || !endDate || !vehicleType) {
      return res.status(400).json({ error: "Missing query parameters" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    if (diffDays < 0 || diffDays > 2) {
      return res
        .status(400)
        .json({ error: "Date range must be between 1 and 3 days" });
    }

    const slotsData = await fs.readFile("./data/slots.json", "utf-8");
    const bookingsData = await fs.readFile("./data/bookings.json", "utf-8");
    const releasesData = await fs.readFile("./data/release.json", "utf-8");

    const slots = JSON.parse(slotsData);
    const bookings = JSON.parse(bookingsData);
    const releases = JSON.parse(releasesData);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const daysToCheck = [];
    const tempDate = new Date(start);
    while (tempDate <= end) {
      daysToCheck.push(formatDate(new Date(tempDate)));
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const availableSlots = [];

    for (const slot of slots) {
      if (slot.type !== vehicleType) continue;

      if (slot.reservedFor && slot.reservedFor !== "temporary") continue;

      const isPermanent = slot.userId !== null;

      // Check if booked on any of the requested dates
      const isBookedOnAnyDay = daysToCheck.some((day) =>
        bookings.some(
          (b) => String(b.slotId) === String(slot.slotId) && b.date === day
        )
      );
      if (isBookedOnAnyDay) continue;

      // For permanent slot: ensure all days are released
      if (isPermanent) {
        const isFullyReleased = daysToCheck.every((day) =>
          releases.some((r) => {
            const from = new Date(r.fromDate);
            const to = new Date(r.toDate);
            return (
              String(r.slotId) === String(slot.slotId) &&
              new Date(day) >= from &&
              new Date(day) <= to
            );
          })
        );
        if (!isFullyReleased) continue;
      }

      // ✅ Passed all checks — push only once
      availableSlots.push({
        slotId: slot.slotId,
        floorNo: slot.floorNo,
        vehicleType: slot.type,
        location: slot.location,
        startDate: startDate,
        endDate: endDate,
        isFromRelease: isPermanent,
      });
    }

    if (availableSlots.length === 0) {
      return res.status(404).json({
        message:
          "No available slots found for selected date range and vehicle type.",
      });
    }

    res.json(availableSlots);
  } catch (error) {
    console.error("Error in /available:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await fs.readFile("./data/bookings.json", "utf-8"); // Read as string directly
    const bookings = JSON.parse(data);

    // Compare as strings to avoid type mismatch
    const userBookings = bookings.filter(
      (b) => String(b.userId) === req.params.id
    );

    res.json(userBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { userId, slotId, startDate, endDate, vehicleType, vehicleNumber } =
      req.body;

    if (
      !userId ||
      !slotId ||
      !startDate ||
      !endDate ||
      !vehicleType ||
      !vehicleNumber
    ) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    const bookingsPath = "./data/bookings.json";
    const slotsPath = "./data/slots.json";

    const bookings = JSON.parse(await fs.readFile(bookingsPath, "utf-8"));
    let slots = JSON.parse(await fs.readFile(slotsPath, "utf-8"));

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start <= today) {
      return res
        .status(400)
        .json({ error: "Booking must start from tomorrow or later" });
    }

    const dayDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (dayDiff < 0 || dayDiff > 2) {
      return res
        .status(400)
        .json({ error: "You can book for a maximum of 3 days" });
    }

    const slot = slots.find((s) => s.slotId === slotId);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    // Generate all booking dates
    const bookingDates = [];
    const curr = new Date(start);
    while (curr <= end) {
      bookingDates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    // Check for conflicts
    for (const date of bookingDates) {
      const conflict = bookings.find(
        (b) => b.slotId === slotId && b.date === date
      );
      if (conflict) {
        return res
          .status(400)
          .json({ error: `Slot ${slotId} is already booked on ${date}` });
      }

      const userConflict = bookings.find(
        (b) => b.userId === userId && b.date === date
      );
      if (userConflict) {
        return res
          .status(400)
          .json({ error: `User already booked on ${date}` });
      }
    }

    const isPermanent = slot.userId !== null;

    const newBookings = bookingDates.map((date, index) => ({
      id: Date.now() + index,
      userId,
      slotId,
      vehicleType,
      vehicleNumber,
      startDate,
      endDate,
      date,
      floorNo: slot.floorNo,
      location: slot.location,
      reservedFor: isPermanent ? "permanent" : "temporary",
      isFromRelease: isPermanent,
    }));

    bookings.push(...newBookings);

    // Update slot info in slots.json
    slots = slots.map((s) => {
      if (s.slotId === slotId) {
        return {
          ...s,
          userId: userId,
          status: "reserved",
          reservedFor: isPermanent ? "permanent" : "temporary",
        };
      }
      return s;
    });

    // Write updates to files
    await fs.writeFile(bookingsPath, JSON.stringify(bookings, null, 2));
    await fs.writeFile(slotsPath, JSON.stringify(slots, null, 2));

    res
      .status(201)
      .json({ message: "Booking successful", bookings: newBookings });
  } catch (error) {
    console.error("Booking error:", error);
    res
      .status(500)
      .json({ error: "Failed to create booking", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const bookingId = Number(req.params.id);

  try {
    // Load bookings
    const bookingsData = await fs.readFile("./data/bookings.json", "utf-8");
    const bookings = JSON.parse(bookingsData);

    const bookingToCancel = bookings.find((b) => b.id === bookingId);
    if (!bookingToCancel) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Remove the booking
    const updatedBookings = bookings.filter((b) => b.id !== bookingId);
    await fs.writeFile(
      "./data/bookings.json",
      JSON.stringify(updatedBookings, null, 2)
    );

    // Restore slot
    const slotsData = await fs.readFile("./data/slots.json", "utf-8");
    let slots = JSON.parse(slotsData);

    slots = slots.map((slot) => {
      if (slot.slotId === bookingToCancel.slotId) {
        return {
          ...slot,
          status: "available",
          reservedFor: null,
          permanentUserId: null,
        };
      }
      return slot;
    });

    await fs.writeFile("./data/slots.json", JSON.stringify(slots, null, 2));

    // (Optional) Preserve cancelled booking
    const cancelledData = await fs
      .readFile("./data/cancelledBookings.json", "utf-8")
      .catch(() => "[]");
    const cancelledBookings = JSON.parse(cancelledData);

    cancelledBookings.push({
      ...bookingToCancel,
      cancelledAt: new Date().toISOString(),
    });

    await fs.writeFile(
      "./data/cancelledBookings.json",
      JSON.stringify(cancelledBookings, null, 2)
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
