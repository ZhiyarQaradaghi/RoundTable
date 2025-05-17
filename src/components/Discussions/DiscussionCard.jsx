import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Stack,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import PropTypes from "prop-types";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CategoryIcon from "@mui/icons-material/Category";
import NotesIcon from "@mui/icons-material/Notes";

function DiscussionCard({ discussion }) {
  const {
    _id,
    title,
    description,
    type,
    topic,
    status,
    startTime,
    endTime,
    maxParticipants,
    currentParticipants,
    creator,
  } = discussion;

  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleExpandClick = () => {
    setIsExpanded(!isExpanded);
  };

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

  const handleJoinDiscussion = (e) => {
    e.stopPropagation();
    navigate(`/discussions/${_id}/join`);
  };

  return (
    <Card
      sx={{
        width: "100%",
        mb: 2.5,
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid #eee",
        bgcolor: "#fff",
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        onClick={handleExpandClick}
        sx={{
          p: 2.5,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111" }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip
              icon={<CategoryIcon fontSize="small" />}
              label={topic?.label || topic}
              size="small"
              variant="outlined"
              sx={{ borderColor: "#ccc", color: "#555" }}
            />
            <Chip
              icon={<NotesIcon fontSize="small" />}
              label={type?.label || type}
              size="small"
              variant="outlined"
              sx={{ borderColor: "#ccc", color: "#555" }}
            />
          </Stack>
        </Stack>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Chip
            label={status}
            size="small"
            sx={{
              bgcolor: status === "active" ? "success.light" : "grey.300",
              color: status === "active" ? "success.dark" : "text.secondary",
              fontWeight: 500,
              mr: 2,
            }}
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleExpandClick();
            }}
            aria-expanded={isExpanded}
            aria-label="show more"
            sx={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0, px: 2.5, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {description}
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarTodayIcon sx={{ fontSize: "1.1rem", color: "#555" }} />
              <Typography variant="body2" sx={{ color: "#333" }}>
                Starts: {formatDateTime(startTime)}
              </Typography>
            </Stack>
            {endTime && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScheduleIcon sx={{ fontSize: "1.1rem", color: "#555" }} />
                <Typography variant="body2" sx={{ color: "#333" }}>
                  Ends: {formatDateTime(endTime)}
                </Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={1}>
              <GroupIcon sx={{ fontSize: "1.1rem", color: "#555" }} />
              <Typography variant="body2" sx={{ color: "#333" }}>
                {currentParticipants}/{maxParticipants} participants
              </Typography>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
              pt: 2,
              borderTop: "1px solid #eee",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={creator?.avatar} sx={{ width: 32, height: 32 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#222" }}
              >
                {creator?.name || creator?.username || "Unknown Creator"}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              onClick={handleJoinDiscussion}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
                px: 2.5,
                py: 0.8,
                "&:hover": {
                  bgcolor: "#222",
                },
              }}
            >
              View & Join
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
}

DiscussionCard.propTypes = {
  discussion: PropTypes.object.isRequired,
};

export default DiscussionCard;
