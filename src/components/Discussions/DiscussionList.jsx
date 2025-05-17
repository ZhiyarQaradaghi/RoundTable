import {
  Box,
  Grid,
  Pagination,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { useDiscussionFilters } from "../../hooks/useDiscussions";
import DiscussionCard from "./DiscussionCard";
import PropTypes from "prop-types";

function DiscussionList({
  filters,
  updateFilters,
  discussions,
  metadata,
  loading,
  availableTopics,
  availableTypes,
}) {
  const typeFilterOptions = availableTypes.map((t) => ({
    value: t.id,
    label: t.label,
  }));

  const topicFilterOptions = availableTopics.map((t) => ({
    value: t.id,
    label: t.label,
  }));

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress sx={{ color: "#000" }} />
      </Box>
    );
  }

  if (!discussions || discussions.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="h6" color="text.secondary">
          No discussions found.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Try adjusting your filters or create a new discussion!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 150, flexGrow: 1 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            label="Type"
            onChange={(e) => updateFilters({ type: e.target.value, page: 1 })}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="">All Types</MenuItem>
            {typeFilterOptions.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 150, flexGrow: 1 }}>
          <InputLabel>Topic</InputLabel>
          <Select
            value={filters.topic}
            label="Topic"
            onChange={(e) => updateFilters({ topic: e.target.value, page: 1 })}
            sx={{ borderRadius: "8px" }}
          >
            <MenuItem value="">All Topics</MenuItem>
            {topicFilterOptions.map((topic) => (
              <MenuItem key={topic.value} value={topic.value}>
                {topic.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box>
        {discussions.map((discussion) => (
          <DiscussionCard key={discussion._id} discussion={discussion} />
        ))}
      </Box>

      {metadata.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={metadata.totalPages}
            page={metadata.currentPage}
            onChange={(event, value) => updateFilters({ page: value })}
            color="primary"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#000",
                borderRadius: "8px",
              },
              "& .Mui-selected": {
                bgcolor: "#000 !important",
                color: "#fff !important",
                "&:hover": { bgcolor: "#222 !important" },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}

DiscussionList.propTypes = {
  filters: PropTypes.object.isRequired,
  updateFilters: PropTypes.func.isRequired,
  discussions: PropTypes.array.isRequired,
  metadata: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  availableTopics: PropTypes.array.isRequired,
  availableTypes: PropTypes.array.isRequired,
};

export default DiscussionList;
