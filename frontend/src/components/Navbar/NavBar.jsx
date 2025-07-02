import { Link, useNavigate } from "react-router-dom";

import styles from "./NavBar.module.css";
import { useState, useEffect } from "react";
export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    setLoggedIn(!!userInfo);
  }, []);
  function handleClick() {
    if (loggedIn) {
      localStorage.removeItem("userInfo");
      setLoggedIn(false);
      navigate("/home");
    } else {
      navigate("/");
    }
  }

  return (
    <nav className={styles.navbar}>
      <p className={styles.title}>
        <strong className={styles.easy}>easy</strong> park
      </p>
      {/* <h1 className={styles.logo}>Find, Book And Parking instantly</h1> */}
      <div className={styles.nav_links}>
        <Link className={styles.nav_link} to="/">
          Home
        </Link>
        <button
          onClick={handleClick}
          className={styles.button_32}
          role="button"
        >
          {loggedIn ? "Logout" : "Login"}
        </button>
      </div>
    </nav>
  );
}
