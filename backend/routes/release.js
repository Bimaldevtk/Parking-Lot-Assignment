import express from "express";
import fs from "node:fs/promises";

const router = express.Router();

// Get all released slots
router.get("/", async (req, res) => {
  try {
    const data = await fs.readFile("./data/release.json", "utf-8");
    const releases = JSON.parse(data);
    res.json(releases);
  } catch (err) {
    res.status(500).json({ error: "Error reading release data" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await fs.readFile("./data/release.json", "utf-8");
    const releases = JSON.parse(data);

    const userRelease = releases.filter(
      (release) => String(release.userId) === req.params.id
    );
    res.json(userRelease);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, slotId, fromDate, toDate } = req.body;

    if (!userId || !slotId || !fromDate || !toDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const data = await fs.readFile("./data/release.json", "utf-8");
    const releases = JSON.parse(data);

    const newRelease = { id: Date.now(), userId, slotId, fromDate, toDate };
    releases.push(newRelease);

    await fs.writeFile(
      "./data/release.json",
      JSON.stringify(releases, null, 2)
    );
    res.status(201).json(newRelease);
  } catch (err) {
    res.status(500).json({ error: "Error saving release data" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const data = await fs.readFile("./data/release.json", "utf-8");
    let releases = JSON.parse(data);

    releases = releases.filter((r) => r.userId != req.params.id);

    await fs.writeFile(
      "./data/release.json",
      JSON.stringify(releases, null, 2)
    );
    res.json({ message: "Release cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Error cancelling release" });
  }
});

export default router;
