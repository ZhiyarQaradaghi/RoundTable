import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SearchBar from "../SearchBar/SearchBar";
import MobileMenu from "../MobileMenu/MobileMenu";
import styles from "./Navigation.module.css";

function Navigation({ userName, onSearch }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <span className={styles.logo}>RoundTable</span>
        <div className={styles.desktopNav}>
          <SearchBar onSearch={onSearch} />
          <div className={styles.userInfo}>
            <span className={styles.userName}>Welcome, {userName}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
        <MobileMenu
          userName={userName}
          onSearch={onSearch}
          onLogout={handleLogout}
        />
      </div>
    </nav>
  );
}

Navigation.propTypes = {
  userName: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default Navigation;
