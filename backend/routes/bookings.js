// Bookings APIs

import express from "express";
import { log } from "node:console";
import fs from "node:fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await fs.readFile("./data/bookings.json");
  const bookings = JSON.parse(data);
  res.json(bookings);
});

router.get("/available", async (req, res) => {
  try {
    const slotsData = await fs.readFile("./data/slots.json", "utf-8");
    const bookingsData = await fs.readFile("./data/bookings.json", "utf-8");
    const releasesData = await fs.readFile("./data/release.json", "utf-8");

    const slots = JSON.parse(slotsData);
    const bookings = JSON.parse(bookingsData);
    const releases = JSON.parse(releasesData);

    const today = new Date();
    const formatDate = (date) => date.toISOString().split("T")[0];

    const daysToCheck = [];
    for (let d = 0; d <= 2; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      daysToCheck.push(formatDate(date));
    }

    const availableSlots = [];

    for (const slot of slots) {
      const isPermanent = slot.permanentUserId !== null;

      for (const day of daysToCheck) {
        const isBooked = bookings.some(
          (b) => b.slotId === slot.slotId && b.date === day
        );

        const isReleased = releases.some((r) => {
          const from = new Date(r.fromDate);
          const to = new Date(r.toDate);
          return (
            r.slotId === slot.slotId &&
            new Date(day) >= from &&
            new Date(day) <= to
          );
        });

        if (!isBooked && (!isPermanent || isReleased)) {
          availableSlots.push({
            slotId: slot.slotId,
            lotId: slot.lotId,
            vehicleType: slot.type,
            date: day,
            isFromRelease: isReleased,
          });
        }
      }
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
    const { userId, slotId, startDate, endDate, vehicleType } = req.body;

    if (!userId || !slotId || !startDate || !endDate || !vehicleType) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }
    console.log(userId, slotId, startDate, endDate, vehicleType);

    const data = await fs.readFile("./data/bookings.json", "utf-8");
    let bookings = JSON.parse(data);

    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check: must start from tomorrow
    if (start <= today) {
      return res
        .status(400)
        .json({ error: "Booking must start from tomorrow or later" });
    }

    // Check: max 3 days
    const dayDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (dayDiff < 0 || dayDiff > 2) {
      return res
        .status(400)
        .json({ error: "You can book for a maximum of 3 days" });
    }

    // Create booking dates
    const bookingDates = [];
    const curr = new Date(start);
    while (curr <= end) {
      bookingDates.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }

    for (const date of bookingDates) {
      const hasUser = bookings.find(
        (b) => b.userId === userId && b.date === date && b.slotId === slotId
      );
      if (hasUser) {
        return res
          .status(400)
          .json({ error: `You already booked a slot on ${date}` });
      }

      const slotTaken = bookings.find(
        (b) => b.slotId === slotId && b.date === date
      );
      if (slotTaken) {
        return res.status(400).json({ error: `Slot ${slotId} already booked` });
      }
    }

    // Add bookings
    const newBookings = bookingDates.map((date) => ({
      id: Date.now(),
      userId,
      slotId,
      vehicleType,
      startDate,
      endDate,
      date,
    }));

    bookings.push(...newBookings);

    await fs.writeFile(
      "./data/bookings.json",
      JSON.stringify(bookings, null, 2)
    );
    const slotsPath = "./data/slots.json";
    const slotsData = await fs.readFile(slotsPath, "utf-8");
    let slots = JSON.parse(slotsData);

    slots = slots.map((slot) => {
      if (slot.slotId === slotId) {
        return {
          ...slot,
          status: "reserved",
          reservedFor: reservedFor || `User ${userId}`,
          permanentUserId: userId,
        };
      }
      return slot;
    });

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
  try {
    // Read and parse the JSON file
    const data = await fs.readFile("./data/bookings.json", "utf-8");
    let bookings = JSON.parse(data);

    // Filter out the booking to be deleted
    bookings = bookings.filter((b) => b.id != req.params.id);

    // Write updated bookings back to the file
    await fs.writeFile(
      "./data/bookings.json",
      JSON.stringify(bookings, null, 2)
    );

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to cancel booking", details: error.message });
  }
});

export default router;
