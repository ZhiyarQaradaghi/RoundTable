import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";
import { FaExclamationTriangle } from "react-icons/fa";

function NotFound() {
  return (
    <div className={styles.container}>
      <FaExclamationTriangle className={styles.icon} />
      <h1 className={styles.title}>404 - Page Not Found</h1>
      <p className={styles.message}>
        Oops! The page you are looking for does not exist. It might have been
        moved or deleted.
      </p>
      <Link to="/home" className={styles.homeLink}>
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;
