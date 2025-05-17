import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation/Navigation";
import { useAuth } from "../context/AuthContext";
import { useDiscussionFilters } from "../hooks/useDiscussions";
import CreateDiscussion from "../components/Discussions/CreateDiscussion";
import DiscussionList from "../components/Discussions/DiscussionList";
import {
  Box,
  Container,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Button,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";

function Home() {
  const { loading: authLoading, username, name } = useAuth();
  const navigate = useNavigate();
  const {
    filters,
    updateFilters,
    discussions,
    metadata,
    loading: discussionsLoading,
    createDiscussion,
    availableTopics,
    availableTypes,
  } = useDiscussionFilters();

  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    setSearchQuery(filters.search);
  }, [filters.search]);

  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleCreateDiscussion = async (data) => {
    try {
      const newDiscussion = await createDiscussion(data);
      setIsCreateOpen(false);
      if (newDiscussion && newDiscussion._id) {
        navigate(`/discussions/${newDiscussion._id}/join`);
      }
    } catch (error) {
      console.error("Failed to create discussion:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery, page: 1 });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Welcome back, {name || username}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Join the conversation or start a new discussion
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateOpen(true)}
            sx={{
              bgcolor: "#000",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "8px",
              textTransform: "none",
              px: 2,
              py: 1,
              "&:hover": { bgcolor: "#222" },
            }}
          >
            Create Discussion
          </Button>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            p: "4px 8px",
            mb: 4,
            display: "flex",
            alignItems: "center",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "none",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search discussions by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>

        <DiscussionList
          filters={filters}
          updateFilters={updateFilters}
          discussions={discussions}
          metadata={metadata}
          loading={discussionsLoading}
          availableTopics={availableTopics}
          availableTypes={availableTypes}
        />

        <CreateDiscussion
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreate={handleCreateDiscussion}
          availableTopics={availableTopics}
          availableTypes={availableTypes}
        />
      </Container>
    </Box>
  );
}

export default Home;
