import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import PermanentUser from "./pages/PermanentUser/PermanentUser";
import Login from "./pages/Login/Login";
import TemporaryPage from "./pages/TemporaryUser/TemporaryPage";
import BookedPage from "./pages/TemporaryUser/BookingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/permanent" element={<PermanentUser />} />
      <Route path="/booked" element={<BookedPage />} />
      <Route path="/temporary" element={<TemporaryPage />} />
    </Routes>
  );
}

export default App;
