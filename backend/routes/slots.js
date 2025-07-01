import express from "express";
import fs from "node:fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await fs.readFile("./data/slots.json");
  const slots = JSON.parse(data);

  res.json(slots);
});

router.post("/", async (req, res) => {
  try {
    const data = await fs.readFile("./data/slots.json", "utf-8");
    const slots = JSON.parse(data);

    const maxId =
      slots.length > 0 ? Math.max(...slots.map((slot) => slot.id)) : 0;

    const { lotId, type, status, reservedFor, permanentUserId } = req.body;

    if (
      lotId === undefined ||
      type === undefined ||
      status === undefined ||
      reservedFor === undefined ||
      permanentUserId === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newSlot = {
      id: maxId + 1,
      lotId,
      type,
      status,
      reservedFor,
      permanentUserId,
    };

    slots.push(newSlot);

    await fs.writeFile("./data/slots.json", JSON.stringify(slots, null, 2));

    res.status(201).json(newSlot);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add slot", error: error.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    // Read and parse the slots JSON
    const data = await fs.readFile("./data/slots.json", "utf-8");
    let slots = JSON.parse(data);

    // Convert param ID to a number to match slot IDs
    const slotId = parseInt(req.params.id);

    // Find the slot index
    const slotIndex = slots.findIndex((slot) => slot.id === slotId);

    // If slot not found, return 404
    if (slotIndex === -1) {
      return res.status(404).json({ message: "Slot not found" });
    }

    // Merge the updated fields
    const updatedSlot = { ...slots[slotIndex], ...req.body };

    // Update the slot in the array
    slots[slotIndex] = updatedSlot;

    // Write the updated slots array back to the file
    await fs.writeFile("./data/slots.json", JSON.stringify(slots, null, 2));

    // Send success response
    res.json({ message: "Slot updated successfully", updatedSlot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update slot", error: error.message });
  }
});

router.get("/available slots", async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Enforce cutoff: booking only before 7 PM
    if (currentHour >= 19) {
      return res
        .status(400)
        .json({ error: "Temporary users can book only before 7:00 PM" });
    }

    // Tomorrow's date (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const slotsRaw = await fs.readFile(("../data/slots.json", "utf-8"));
    const releasesRaw = await fs.readFile("../data/release.json", "utf-8");

    const slots = JSON.parse(slotsRaw);
    const releases = JSON.parse(releasesRaw);

    const availableSlots = [];

    for (const slot of slots) {
      if (slot.status === "available") {
        availableSlots.push({ ...slot, reason: "available" });
      } else {
        const isReleasedTomorrow = releases.some((release) => {
          return (
            release.slotId === slot.id &&
            new Date(release.fromDate) <= tomorrow &&
            new Date(release.toDate) >= tomorrow
          );
        });

        if (isReleasedTomorrow) {
          availableSlots.push({ ...slot, reason: "released" });
        }
      }
    }

    res.json(availableSlots);
  } catch (err) {
    console.error("Error fetching available slots:", err);
    res.status(500).json({ error: "Could not fetch available slots" });
  }
});

export default router;
