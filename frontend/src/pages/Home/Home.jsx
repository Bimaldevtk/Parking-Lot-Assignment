import Navbar from "../../components/Navbar/NavBar";
import CheckInForm from "../../components/CheckInForm/CheckinForm";
import styles from "./Home.module.css";

export default function Home() {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  return (
    <div className={styles.background}>
      <Navbar />

      <section className={styles.section_1}>
        <p className={styles.welcome}>Welcome to</p>
        <p className={styles.title}>
          <strong className={styles.easy}>easy</strong> park
        </p>
        <p className={styles.sentence}>
          Tired of circling for parking? With ParkEase, you can find and book
          <br />
          the perfect spot in just a few taps — fast, easy, and stress-free!
        </p>
      </section>

      <section className={styles.section_2}>
        <p className={styles.title}>
          {user ? "Book Your Slot Now" : "Login and Book Now"}
        </p>
        <CheckInForm />
      </section>
    </div>
  );
}
