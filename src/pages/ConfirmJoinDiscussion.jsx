import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDiscussionFilters } from "../hooks/useDiscussions";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Chip,
  Grid,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CategoryIcon from "@mui/icons-material/Category";
import NotesIcon from "@mui/icons-material/Notes";
import PropTypes from "prop-types";

const DetailItem = ({ icon, label, value }) => (
  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
    {icon}
    <Typography variant="body1">
      <Box component="span" sx={{ fontWeight: 500 }}>
        {label}:
      </Box>{" "}
      {value}
    </Typography>
  </Stack>
);

export default function ConfirmJoinDiscussion() {
  const { discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchDiscussionById,
    joinDiscussionById,
    currentDiscussion,
    loadingDiscussion,
  } = useDiscussionFilters();

  const [error, setError] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (discussionId) {
      fetchDiscussionById(discussionId).catch((err) =>
        setError(err.message || "Failed to load discussion details.")
      );
    }
  }, [discussionId, fetchDiscussionById]);

  useEffect(() => {
    if (currentDiscussion && user) {
      const alreadyJoined = currentDiscussion.participants.some(
        (p) => p._id === user.id
      );
      setIsJoined(alreadyJoined);
    }
  }, [currentDiscussion, user]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date =
        typeof dateString === "string"
          ? parseISO(dateString)
          : new Date(dateString);
      return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleJoin = async () => {
    setJoinError(null);
    setIsJoining(true);
    try {
      await joinDiscussionById(discussionId);
      setIsJoined(true);
      navigate(`/discussions/${discussionId}`);
    } catch (err) {
      setJoinError(err.message || "Failed to join discussion.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loadingDiscussion) {
    return (
      <Container
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!currentDiscussion) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <Typography>Discussion not found.</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Go Home
        </Button>
      </Container>
    );
  }

  const {
    title,
    description,
    type,
    topic,
    startTime,
    endTime,
    maxParticipants,
    currentParticipants,
    creator,
    status,
  } = currentDiscussion;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: "12px" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip
            label={status}
            color={status === "active" ? "success" : "default"}
          />
        </Stack>

        <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: "8px" }}>
          <DetailItem
            icon={<NotesIcon color="action" />}
            label="Description"
            value={description}
          />
        </Box>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<CategoryIcon color="action" />}
              label="Topic"
              value={topic?.label || topic}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<NotesIcon color="action" />}
              label="Type"
              value={type?.label || type}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<CalendarTodayIcon color="action" />}
              label="Starts"
              value={formatDateTime(startTime)}
            />
          </Grid>
          {endTime && (
            <Grid item xs={12} sm={6}>
              <DetailItem
                icon={<ScheduleIcon color="action" />}
                label="Ends"
                value={formatDateTime(endTime)}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<GroupIcon color="action" />}
              label="Participants"
              value={`${currentParticipants} / ${maxParticipants}`}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <Avatar
            src={creator?.avatar}
            sx={{ width: 40, height: 40, mr: 1.5 }}
          />
          <Typography variant="subtitle1">
            Created by:{" "}
            <Box component="span" sx={{ fontWeight: 500 }}>
              {creator?.name || creator?.username}
            </Box>
          </Typography>
        </Box>

        {joinError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {joinError}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: "#000",
              color: "#000",
              "&:hover": {
                borderColor: "#333",
                backgroundColor: "rgba(0,0,0,0.04)",
              },
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleJoin}
            disabled={
              isJoining || isJoined || currentParticipants >= maxParticipants
            }
            sx={{
              bgcolor: "#000",
              color: "#fff",
              "&:hover": { bgcolor: "#222" },
              "&.Mui-disabled": { bgcolor: "grey.300" },
            }}
          >
            {isJoining ? (
              <CircularProgress size={24} color="inherit" />
            ) : isJoined ? (
              "Already Joined"
            ) : currentParticipants >= maxParticipants ? (
              "Discussion Full"
            ) : (
              "Join Discussion"
            )}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

DetailItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};
