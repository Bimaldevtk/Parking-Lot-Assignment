import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (!user) {
      // ✅ Save temporary state before redirect
      const isCheckInPage = location.pathname === "/temporary";
      if (isCheckInPage) {
        const form = localStorage.getItem("formState");
        const slots = localStorage.getItem("availableSlots");

        if (form && slots) {
          localStorage.setItem(
            "redirectTempData",
            JSON.stringify({ form, slots })
          );
        }
      }

      localStorage.setItem("redirectTo", location.pathname);
      navigate("/", { replace: true });
    }
  }, [user, navigate, location]);

  return user ? children : null;
}
