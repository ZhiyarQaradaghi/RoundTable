import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";

function Navigation() {
  const { loading, username, name, avatar, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate("/landing");
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  if (loading) {
    return (
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            RoundTable
          </Typography>

          {username ? (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "#000", color: "#fff" }}
                  src={avatar}
                >
                  {name ? name.charAt(0) : username.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  ".MuiPaper-root": {
                    borderRadius: "8px",
                    mt: 1,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <MenuItem
                  onClick={handleProfile}
                  sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: "#000",
                  borderColor: "#000",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
                variant="outlined"
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                sx={{
                  bgcolor: "#000",
                  color: "#fff",
                  "&:hover": { bgcolor: "#333" },
                }}
                variant="contained"
              >
                Sign Up
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;
