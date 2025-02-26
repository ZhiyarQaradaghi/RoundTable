import { useNavigate } from "react-router-dom";
import styles from "./CreateDiscussionButton.module.css";

function CreateDiscussionButton() {
  const navigate = useNavigate();

  return (
    <button
      className={styles.createButton}
      onClick={() => navigate("/create-discussion")}
    >
      <svg
        className={styles.plusIcon}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          fill="currentColor"
        />
      </svg>
      Create Discussion
    </button>
  );
}

export default CreateDiscussionButton;
