import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/userSlice";
import { fetchBooking } from "../../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      const user = data.user;

      if (response.ok) {
        dispatch(setUserInfo(user));
        localStorage.setItem("userInfo", JSON.stringify(user));
        const booking = await fetchBooking(user.id);
        const isBooked = booking?.length > 0;

        alert(data.message);
        if (user.role === "user") {
          if (user.isPermanent) {
            navigate("/permanent");
          } else if (!user.isPermanent && isBooked) {
            navigate("/booked");
          } else if (!user.isPermanent && !isBooked) {
            navigate("/");
          }
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("error in Connecting Server");
      console.log(err);
    }
    alert(`Login clicked: ${username}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.title}>EASY PARK</div>
        <form onSubmit={handleLogin}>
          <input
            type="username"
            placeholder="User Name"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
