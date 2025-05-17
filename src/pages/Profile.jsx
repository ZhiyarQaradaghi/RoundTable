import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Navigation from "../components/Navigation/Navigation";

export default function ProfilePage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    if (isEditing && user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await updateUser(formData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading && !user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#000" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
            bgcolor: "#fff",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: "#000" }}
            >
              My Profile
            </Typography>
            <IconButton
              onClick={handleEditToggle}
              sx={{
                color: "#000",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
              aria-label={isEditing ? "Cancel" : "Edit profile"}
            >
              {isEditing ? <CancelIcon /> : <EditIcon />}
            </IconButton>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "center", mb: 2 }}
              >
                <Avatar
                  src={
                    formData.avatar ||
                    `https://ui-avatars.com/api/?name=${
                      formData.name || formData.username
                    }&background=000&color=fff&size=128`
                  }
                  alt={formData.name || formData.username}
                  sx={{ width: 120, height: 120, border: "3px solid #000" }}
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Avatar URL"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{ sx: { color: "#555" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ccc" },
                        "&:hover fieldset": { borderColor: "#000" },
                        "&.Mui-focused fieldset": { borderColor: "#000" },
                        color: "#000",
                      },
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{
                    disableUnderline: !isEditing,
                    readOnly: !isEditing,
                    sx: { bgcolor: isEditing ? "transparent" : "#f9f9f9" },
                  }}
                  InputLabelProps={{ sx: { color: "#555" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#ccc" },
                      "&:hover fieldset": { borderColor: "#000" },
                      "&.Mui-focused fieldset": { borderColor: "#000" },
                      color: "#000",
                    },
                    "& .MuiFilledInput-root": {
                      bgcolor: "#f0f0f0",
                      "&:hover": { bgcolor: "#e9e9e9" },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled // Username typically not editable
                  variant={"filled"}
                  InputProps={{
                    disableUnderline: true,
                    readOnly: true,
                    sx: { bgcolor: "#f0f0f0" },
                  }}
                  InputLabelProps={{ sx: { color: "#555" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled // Email typically not editable or requires special verification
                  variant={"filled"}
                  InputProps={{
                    disableUnderline: true,
                    readOnly: true,
                    sx: { bgcolor: "#f0f0f0" },
                  }}
                  InputLabelProps={{ sx: { color: "#555" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  multiline
                  rows={4}
                  variant={isEditing ? "outlined" : "filled"}
                  InputProps={{
                    disableUnderline: !isEditing,
                    readOnly: !isEditing,
                    sx: { bgcolor: isEditing ? "transparent" : "#f9f9f9" },
                  }}
                  InputLabelProps={{ sx: { color: "#555" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#ccc" },
                      "&:hover fieldset": { borderColor: "#000" },
                      "&.Mui-focused fieldset": { borderColor: "#000" },
                      color: "#000",
                    },
                    "& .MuiFilledInput-root": {
                      bgcolor: "#f0f0f0",
                      "&:hover": { bgcolor: "#e9e9e9" },
                    },
                  }}
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="flex-end"
                    mt={2}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleEditToggle}
                      startIcon={<CancelIcon />}
                      sx={{
                        borderColor: "#000",
                        color: "#000",
                        "&:hover": {
                          borderColor: "#333",
                          backgroundColor: "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={submitting}
                      startIcon={
                        submitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      sx={{
                        bgcolor: "#000",
                        color: "#fff",
                        "&:hover": { bgcolor: "#222" },
                        "&.Mui-disabled": { bgcolor: "grey.400" },
                      }}
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
}
