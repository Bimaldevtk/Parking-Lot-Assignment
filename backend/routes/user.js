import express from "express";
import fs from "node:fs/promises";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Read user data
    const data = await fs.readFile("./data/users.json", "utf-8");
    const users = JSON.parse(data);

    // Check if user exists
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      res.json({ message: "Login successful", user });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
