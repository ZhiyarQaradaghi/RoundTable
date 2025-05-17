import { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "../config/api";

const AVAILABLE_TYPES = [
  { id: "free talk", label: "Free Talk" },
  { id: "queue", label: "Queue Based" },
];

const AVAILABLE_TOPICS = [
  { id: "technology", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
  { id: "education", label: "Education" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "general", label: "General" },
  { id: "other", label: "Other" },
];

export const useDiscussionFilters = () => {
  const [filters, setFilters] = useState({
    type: "",
    status: "active",
    page: 1,
    limit: 10,
    topic: "",
    search: "",
  });

  const [discussions, setDiscussions] = useState([]);
  const [metadata, setMetadata] = useState({
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [currentDiscussion, setCurrentDiscussion] = useState(null);
  const [loadingDiscussion, setLoadingDiscussion] = useState(false);

  const fetchDiscussions = useCallback(async () => {
    try {
      setLoading(true);
      const activeFilters = { ...filters };
      Object.keys(activeFilters).forEach((key) => {
        if (activeFilters[key] === "" || activeFilters[key] === null) {
          delete activeFilters[key];
        }
      });
      const queryParams = new URLSearchParams(activeFilters);
      const response = await fetch(
        getApiUrl(`/api/discussions?${queryParams}`),
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDiscussions(data.discussions || []);
      setMetadata({
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        totalDiscussions: data.totalDiscussions || 0,
      });
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const createDiscussion = async (discussionData) => {
    try {
      const formattedData = {
        ...discussionData,
        type: discussionData.type === "queue" ? "Queue Based" : "Free Talk",
        startTime: new Date(discussionData.startTime).toISOString(),
        endTime: discussionData.endTime
          ? new Date(discussionData.endTime).toISOString()
          : undefined,
        participants: [],
        speakingQueue: [],
      };

      const response = await fetch(getApiUrl("/api/discussions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message || errorData.error || "Failed to create discussion"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Create discussion error:", error);
      throw error;
    }
  };

  const fetchDiscussionById = useCallback(async (discussionId) => {
    setLoadingDiscussion(true);
    setCurrentDiscussion(null);
    try {
      const response = await fetch(
        getApiUrl(`/api/discussions/${discussionId}`),
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          mode: "cors",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setCurrentDiscussion(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch discussion by ID:", error);
      setCurrentDiscussion(null);
      throw error;
    } finally {
      setLoadingDiscussion(false);
    }
  }, []);

  const joinDiscussionById = async (discussionId) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/discussions/${discussionId}/join`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      await fetchDiscussionById(discussionId);
      return data;
    } catch (error) {
      console.error("Failed to join discussion:", error);
      throw error;
    }
  };

  const leaveDiscussion = async (discussionId) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/discussions/${discussionId}/leave`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      await fetchDiscussionById(discussionId);
      return data;
    } catch (error) {
      throw new Error("Failed to leave discussion");
    }
  };

  return {
    filters,
    updateFilters,
    discussions,
    metadata,
    loading,
    createDiscussion,
    availableTypes: AVAILABLE_TYPES,
    availableTopics: AVAILABLE_TOPICS,
    fetchDiscussionById,
    joinDiscussionById,
    currentDiscussion,
    loadingDiscussion,
    leaveDiscussion,
  };
};

export const fetchChatMessagesForDiscussion = async (discussionId) => {
  if (!discussionId) throw new Error("Discussion ID is required.");
  try {
    const response = await fetch(
      getApiUrl(`/api/discussions/${discussionId}/messages`),
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch chat messages:", error);
    throw error;
  }
};

export const sendChatMessageForDiscussion = async (discussionId, content) => {
  if (!discussionId) throw new Error("Discussion ID is required.");
  if (!content || content.trim() === "")
    throw new Error("Message content cannot be empty.");
  try {
    const response = await fetch(
      getApiUrl(`/api/discussions/${discussionId}/messages`),
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `HTTP error! status: ${response.status}`
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
};
