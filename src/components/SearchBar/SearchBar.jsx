import styles from "./SearchBar.module.css";
import PropTypes from "prop-types";

function SearchBar({ onSearch }) {
  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search discussions..."
        className={styles.searchInput}
        onChange={(e) => onSearch(e.target.value)}
      />
      <svg
        className={styles.searchIcon}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.5 3a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM1 8.5a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
          fill="currentColor"
        />
        <path
          d="M13.293 13.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
