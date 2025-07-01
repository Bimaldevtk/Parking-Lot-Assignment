// Lots APIs
import express from "express";
import fs from "node:fs/promises";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await fs.readFile("./data/lots.json", "utf-8"); // Read as string
  const lots = JSON.parse(data); // Parse JSON
  res.json(lots); // Send JSON response
});

export default router;
