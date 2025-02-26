import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Please sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.button}>
            Sign in
          </button>
        </form>

        <Link to="/signup" className={styles.link}>
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}

export default Login;
