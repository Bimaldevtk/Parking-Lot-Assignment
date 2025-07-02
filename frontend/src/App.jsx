import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import PermanentUser from "./pages/PermanentUser/PermanentUser";
import Login from "./pages/Login/Login";
import TemporaryPage from "./pages/TemporaryUser/TemporaryPage";
import BookedPage from "./pages/TemporaryUser/BookingPage";
import RequireAuth from "./components/RequireAuth/RequireAuth";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/permanent"
        element={
          <RequireAuth>
            <PermanentUser />
          </RequireAuth>
        }
      />
      <Route
        path="/temporary"
        element={
          <RequireAuth>
            <TemporaryPage />
          </RequireAuth>
        }
      />
      <Route
        path="/booked"
        element={
          <RequireAuth>
            <BookedPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
