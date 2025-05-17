import { Stack, Chip } from "@mui/material";
import PropTypes from "prop-types";

function FilterBar({ filters, availableFilters, onChange }) {
  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1}>
        {availableFilters.topics.map((topic) => (
          <Chip
            key={topic.id}
            label={topic.label}
            onClick={() => onChange("topic", topic.id)}
            variant={filters.topic === topic.id ? "filled" : "outlined"}
            sx={{
              borderColor: "#000",
              bgcolor: filters.topic === topic.id ? "#000" : "transparent",
              color: filters.topic === topic.id ? "#fff" : "#000",
              "&:hover": {
                bgcolor: filters.topic === topic.id ? "#222" : "#f5f5f5",
              },
            }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1}>
        {availableFilters.types.map((type) => (
          <Chip
            key={type.id}
            label={type.label}
            onClick={() => onChange("type", type.id)}
            variant={filters.type === type.id ? "filled" : "outlined"}
            sx={{
              borderColor: "#000",
              bgcolor: filters.type === type.id ? "#000" : "transparent",
              color: filters.type === type.id ? "#fff" : "#000",
              "&:hover": {
                bgcolor: filters.type === type.id ? "#222" : "#f5f5f5",
              },
            }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1}>
        {availableFilters.statuses.map((status) => (
          <Chip
            key={status.id}
            label={status.label}
            onClick={() => onChange("status", status.id)}
            variant={filters.status === status.id ? "filled" : "outlined"}
            sx={{
              borderColor: "#000",
              bgcolor: filters.status === status.id ? "#000" : "transparent",
              color: filters.status === status.id ? "#fff" : "#000",
              "&:hover": {
                bgcolor: filters.status === status.id ? "#222" : "#f5f5f5",
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}

FilterBar.propTypes = {
  filters: PropTypes.object.isRequired,
  availableFilters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FilterBar;
