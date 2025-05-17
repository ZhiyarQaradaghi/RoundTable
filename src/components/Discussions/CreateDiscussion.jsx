import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";

const formatDateForDateTimeLocalInput = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreateDiscussion({
  open,
  onClose,
  onCreate,
  availableTopics,
  availableTypes,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    type: "free talk",
    maxParticipants: 10,
    startTime: formatDateForDateTimeLocalInput(new Date()),
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        topic: availableTopics.length > 0 ? "" : "",
        type: availableTypes.length > 0 ? "free talk" : "",
        maxParticipants: 10,
        startTime: formatDateForDateTimeLocalInput(new Date()),
        endTime: "",
      });
    }
  }, [open, availableTopics, availableTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.endTime) {
        delete dataToSubmit.endTime;
      }
      await onCreate(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Failed to create discussion:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create Discussion</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Topic</InputLabel>
              <Select
                value={formData.topic}
                label="Topic"
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              >
                <MenuItem value="" disabled>
                  Select a topic
                </MenuItem>
                {availableTopics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {availableTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Max Participants"
              type="number"
              fullWidth
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxParticipants: Number(e.target.value),
                })
              }
              inputProps={{ min: 2, max: 100 }}
              required
            />

            <TextField
              label="Start Time"
              type="datetime-local"
              fullWidth
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="End Time (Optional)"
              type="datetime-local"
              fullWidth
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              bgcolor: "#000",
              "&:hover": { bgcolor: "#222" },
            }}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

CreateDiscussion.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  availableTopics: PropTypes.array.isRequired,
  availableTypes: PropTypes.array.isRequired,
};
