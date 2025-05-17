import { Typography, Box } from "@mui/material";

export default function UserNameWithRole({ user }) {
  if (!user) {
    return null;
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography component="span">
        {user.name || user.username}
        {user.role === "admin" && (
          <Typography
            component="span"
            sx={{
              ml: 0.5,
              fontSize: "0.75em",
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            (admin)
          </Typography>
        )}
      </Typography>
    </Box>
  );
}
