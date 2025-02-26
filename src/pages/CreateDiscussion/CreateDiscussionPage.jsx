import { useNavigate } from "react-router-dom";
import DiscussionForm from "../../components/DiscussionForm/DiscussionForm";
import styles from "./CreateDiscussionPage.module.css";

function CreateDiscussionPage() {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    // Here you would typically make an API call to create the discussion
    console.log("Creating discussion:", formData);
    // After successful creation, navigate back to home
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Create New Discussion</h1>
        <DiscussionForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

export default CreateDiscussionPage;
