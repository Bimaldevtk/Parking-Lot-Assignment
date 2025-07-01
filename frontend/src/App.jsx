import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import { Routes, Route } from "react-router-dom";
import PermanentUser from "./components/PermanentUser/PermanentUser";
import BookingInfoCard from "./components/TemporaryUser/BookingInfoCard";
import Navbar from "./components/Navbar/NavBar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/permanent" element={<PermanentUser />} />
      <Route path="/booked" element={<BookingInfoCard />} />
    </Routes>
  );
}

export default App;
