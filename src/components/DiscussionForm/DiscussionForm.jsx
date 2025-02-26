import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./DiscussionForm.module.css";

const TAGS = [
  "Politics",
  "Gaming",
  "Economy",
  "Technology",
  "Science",
  "Sports",
];
const DISCUSSION_TYPES = ["Free Talk", "Queue Based", "Moderated"];

function DiscussionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    tags: [],
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.type) {
      newErrors.type = "Discussion type is required";
    }
    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    } else {
      setErrors(newErrors);
    }
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          className={styles.input}
          placeholder="Enter discussion title"
        />
        {errors.title && <span className={styles.error}>{errors.title}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className={styles.textarea}
          placeholder="Describe your discussion"
          rows={4}
        />
        {errors.description && (
          <span className={styles.error}>{errors.description}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Discussion Type</label>
        <div className={styles.typeButtons}>
          {DISCUSSION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.typeButton} ${
                formData.type === type ? styles.active : ""
              }`}
              onClick={() => setFormData((prev) => ({ ...prev, type }))}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.type && <span className={styles.error}>{errors.type}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Tags</label>
        <div className={styles.tagButtons}>
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.tagButton} ${
                formData.tags.includes(tag) ? styles.active : ""
              }`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        {errors.tags && <span className={styles.error}>{errors.tags}</span>}
      </div>

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          Create Discussion
        </button>
      </div>
    </form>
  );
}

DiscussionForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DiscussionForm;
