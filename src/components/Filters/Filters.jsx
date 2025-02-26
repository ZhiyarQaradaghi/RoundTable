import CreateDiscussion from "../CreateDiscussion/CreateDiscussionButton";
import PropTypes from "prop-types";
import styles from "./Filters.module.css";

function Filters({
  tags,
  discussionTypes,
  selectedTag,
  selectedType,
  onTagSelect,
  onTypeSelect,
  onCreateDiscussion,
}) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>Filter by topic</h2>
        <CreateDiscussion onClick={onCreateDiscussion} />
      </div>
      <div className={styles.filterGroups}>
        <div className={styles.filterGroup}>
          <div className={styles.tagList}>
            {tags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagButton} ${
                  selectedTag === tag ? styles.active : ""
                }`}
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <h2 className={styles.filterTitle}>Discussion Type</h2>
          <div className={styles.tagList}>
            <button
              className={`${styles.tagButton} ${
                selectedType === "All" ? styles.active : ""
              }`}
              onClick={() => onTypeSelect("All")}
            >
              All Types
            </button>
            {discussionTypes.map((type) => (
              <button
                key={type}
                className={`${styles.tagButton} ${
                  selectedType === type ? styles.active : ""
                }`}
                onClick={() => onTypeSelect(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Filters.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  discussionTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTag: PropTypes.string.isRequired,
  selectedType: PropTypes.string.isRequired,
  onTagSelect: PropTypes.func.isRequired,
  onTypeSelect: PropTypes.func.isRequired,
  onCreateDiscussion: PropTypes.func.isRequired,
};

export default Filters;
