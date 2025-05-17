import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Signup.module.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const validateUsername = (value) => {
    return /^[a-zA-Z0-9_]{3,}$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const credentials = {
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        password: password,
      };

      await signup(credentials);
      navigate("/home");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Join RoundTable</h1>
        <p className={styles.subtitle}>Start your discussion journey</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              pattern="[a-zA-Z0-9_]{3,}"
              title="Username must be at least 3 characters and contain only letters, numbers, and underscores"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${
              isSubmitting ? styles.loading : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.loginText}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className={styles.loginLink}
            disabled={isSubmitting}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
