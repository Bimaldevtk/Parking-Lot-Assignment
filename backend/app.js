import bodyParser from "body-parser";
import express from "express";
import userRoutes from "./routes/user.js";
import slotRoutes from "./routes/slots.js";
import lotRoutes from "./routes/lots.js";
import bookingRoutes from "./routes/bookings.js";
import releaseRoutes from "./routes/release.js";

const app = express();

app.use(express.static("images"));
app.use(express.json());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all domains
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  next();
});

app.use("/api/login", userRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/lots", lotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/release", releaseRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
