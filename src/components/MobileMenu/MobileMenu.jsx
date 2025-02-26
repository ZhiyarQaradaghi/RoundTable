import { useState } from "react";
import PropTypes from "prop-types";
import SearchBar from "../SearchBar/SearchBar";
import styles from "./MobileMenu.module.css";

function MobileMenu({ userName, onSearch, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.mobileMenuContainer}>
      <button
        className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ""}`}>
        <button
          className={styles.closeButton}
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.293 6.293a1 1 0 011.414 0L12 10.586l4.293-4.293a1 1 0 111.414 1.414L13.414 12l4.293 4.293a1 1 0 01-1.414 1.414L12 13.414l-4.293 4.293a1 1 0 01-1.414-1.414L10.586 12 6.293 7.707a1 1 0 010-1.414z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div className={styles.menuContent}>
          <div className={styles.userSection}>
            <span className={styles.userName}>Welcome, {userName}</span>
            <button onClick={onLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
          <div className={styles.searchSection}>
            <SearchBar onSearch={onSearch} />
          </div>
        </div>
      </div>
    </div>
  );
}

MobileMenu.propTypes = {
  userName: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default MobileMenu;
