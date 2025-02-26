import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.setItem("isAuthenticated", "true");
    navigate("/home");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join us today</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Create a password"
            />
          </div>

          <button type="submit" className={styles.button}>
            Sign up
          </button>
        </form>

        <Link to="/login" className={styles.link}>
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}

export default Signup;
