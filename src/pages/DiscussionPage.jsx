import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  useDiscussionFilters,
  fetchChatMessagesForDiscussion,
  sendChatMessageForDiscussion,
} from "../hooks/useDiscussions";
import { useSocket } from "../context/SocketContext.jsx";
import { useVoiceChat } from "../hooks/useVoiceChat";
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Divider,
  IconButton,
  Stack,
  Chip,
  Drawer,
  TextField,
  Fab,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import ReportIcon from "@mui/icons-material/Report";
import Navigation from "../components/Navigation/Navigation";
import { reportUserOrDiscussion } from "../hooks/useReports";
import UserNameWithRole from "../components/UserNameWithRole";
import Reactions from "../components/Discussions/Reactions";
import FloatingReaction from "../components/Discussions/FloatingReaction";
import PropTypes from "prop-types";
function DiscussionPage() {
  const { discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentDiscussion, fetchDiscussionById, leaveDiscussion } =
    useDiscussionFilters();
  const { socket } = useSocket();
  const {
    startVoiceChat,
    stopVoiceChat,
    peers,
    speakingUsers,
    isLocalSpeaking,
  } = useVoiceChat(socket, discussionId);
  const [isMicActive, setIsMicActive] = useState(false);
  const [speakingQueue, setSpeakingQueue] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentChatMessage, setCurrentChatMessage] = useState("");
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportType, setReportType] = useState("user");
  const [reportCategory, setReportCategory] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");

  const [reactions, setReactions] = useState([]);

  const audioElements = useRef({});

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (discussionId) {
      fetchDiscussionById(discussionId);
      const loadMessages = async () => {
        setIsLoadingChatMessages(true);
        try {
          const messagesData = await fetchChatMessagesForDiscussion(
            discussionId
          );
          const formattedMessages = (messagesData.messages || []).map(
            (msg) => ({
              ...msg,
              text: msg.content || msg.text,
            })
          );
          setChatMessages(formattedMessages);
        } catch (error) {
          console.error("Failed to load chat messages:", error);
          setChatMessages([]);
        } finally {
          setIsLoadingChatMessages(false);
        }
      };
      loadMessages();
    }
  }, [discussionId, fetchDiscussionById]);

  useEffect(() => {
    if (currentDiscussion) {
      setParticipants(currentDiscussion.participants || []);
      setSpeakingQueue(currentDiscussion.speakingQueue || []);
    }
  }, [currentDiscussion]);

  useEffect(() => {
    if (socket && discussionId) {
      socket.emit("join_discussion", discussionId);

      socket.on("connect", () => {});

      socket.on("speaking_queue_updated", (updatedQueue) => {
        setSpeakingQueue(updatedQueue);
      });

      socket.on("participants_updated", (updatedParticipants) => {
        setParticipants(updatedParticipants);
      });

      socket.on("member_left", ({ userId }) => {
        setParticipants((prevParticipants) =>
          prevParticipants.filter((p) => p._id !== userId)
        );
      });

      socket.on("receive_message", (newMessage) => {
        setChatMessages((prevMessages) => {
          if (!prevMessages.find((msg) => msg._id === newMessage._id)) {
            const messageToDisplay = {
              ...newMessage,
              text: newMessage.content,
            };
            return [...prevMessages, messageToDisplay];
          }
          return prevMessages;
        });
      });

      socket.on("reaction", (type) => {
        const newReaction = {
          id: Date.now(),
          type,
          position: {
            x: Math.random() * 60 + 20,
            y: Math.random() * 40 + 30,
          },
        };
        setReactions((prev) => [...prev, newReaction]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
        }, 2000);
      });

      return () => {
        socket.off("speaking_queue_updated");
        socket.off("participants_updated");
        socket.off("member_left");
        socket.off("connect");
        socket.off("receive_message");
      };
    }
  }, [socket, discussionId]);

  useEffect(() => {
    Object.entries(peers).forEach(([userId, stream]) => {
      if (!audioElements.current[userId]) {
        const audio = new Audio();
        audio.id = `audio-${userId}`;
        audio.srcObject = stream;
        audio.autoplay = true;
        audio.playsInline = true;
        audio.controls = true;
        audio.muted = false;
        audio.volume = 1.0;

        const startAudio = async () => {
          try {
            await audio.play();
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
              audioTrack.enabled = true;
            }
          } catch (err) {
            console.error("Audio playback error:", err.name);
            document.addEventListener(
              "touchstart",
              function playOnTouch() {
                audio
                  .play()
                  .then(() => console.log("Audio playing after touch"))
                  .catch((e) => console.error("Play failed after touch:", e));
                document.removeEventListener("touchstart", playOnTouch);
              },
              { once: true }
            );
          }
        };

        startAudio();
        document.body.appendChild(audio);
        audioElements.current[userId] = audio;
      }
    });

    return () => {
      Object.entries(audioElements.current).forEach(([userId, audio]) => {
        if (audio.srcObject) {
          audio.srcObject.getTracks().forEach((track) => track.stop());
        }
        audio.srcObject = null;
        audio.remove();
        delete audioElements.current[userId];
      });
    };
  }, [peers]);

  const isFreeTalkType = currentDiscussion?.type?.toLowerCase() === "free talk";
  const isQueueBasedDiscussion = !isFreeTalkType;

  const isMyTurn =
    user &&
    speakingQueue.length > 0 &&
    String(speakingQueue[0]._id) === String(user._id);

  useEffect(() => {
    if (isQueueBasedDiscussion && !isMyTurn && isMicActive) {
      setIsMicActive(false);
    }
  }, [isQueueBasedDiscussion, isMyTurn, isMicActive]);

  const handleToggleMic = async () => {
    if (isQueueBasedDiscussion && !isMyTurn) {
      return;
    }

    if (!isMicActive) {
      await startVoiceChat();
      setIsMicActive(true);
    } else {
      stopVoiceChat();
      setIsMicActive(false);
    }
  };

  const handleToggleQueue = () => {
    if (!socket || !user || !discussionId) return;
    try {
      const userInQueue = speakingQueue.some(
        (speaker) => String(speaker?._id) === String(user?._id)
      );
      const event = userInQueue
        ? "leave_speaking_queue"
        : "join_speaking_queue";
      socket.emit(event, { discussionId });
    } catch (error) {
      console.error("Error in handleToggleQueue:", error);
    }
  };

  const handleLeaveDiscussion = async () => {
    try {
      if (socket && discussionId) {
        socket.emit("leave_discussion", discussionId);
      }
      await leaveDiscussion(discussionId);
      navigate("/");
    } catch (error) {
      console.error("Failed to leave discussion:", error);
    }
  };

  const handleSendChatMessage = async () => {
    if (currentChatMessage.trim() && user && discussionId) {
      try {
        await sendChatMessageForDiscussion(
          discussionId,
          currentChatMessage.trim()
        );
        setCurrentChatMessage("");
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const userInSpeakingQueue =
    user &&
    speakingQueue.some((speaker) => String(speaker._id) === String(user._id));

  const formatMessageTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const openReportModal = (target, type = "user") => {
    setReportTarget(target);
    setReportType(type);
    setReportCategory("");
    setReportDescription("");
    setReportOpen(true);
    setReportSuccess(false);
    setReportError("");
  };

  const handleReportSubmit = async () => {
    setReportLoading(true);
    setReportError("");
    try {
      await reportUserOrDiscussion({
        reportedUser: reportType === "user" ? reportTarget._id : undefined,
        discussion: reportType === "discussion" ? discussionId : undefined,
        category: reportCategory,
        description: reportDescription,
      });
      setReportSuccess(true);
      setReportOpen(false);
    } catch (err) {
      setReportError("Failed to submit report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleReaction = (type) => {
    if (socket && discussionId) {
      socket.emit("reaction", { discussionId, type });
      const newReaction = {
        id: Date.now(),
        type,
        position: {
          x: Math.random() * 60 + 20,
          y: Math.random() * 40 + 30,
        },
      };
      setReactions((prev) => [...prev, newReaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
      }, 2000);
    }
  };

  const ParticipantItem = ({ participant }) => {
    const isSpeaking =
      speakingUsers.has(participant._id) ||
      (participant._id === user?._id && isLocalSpeaking);

    return (
      <ListItem
        sx={{
          transition: "all 0.2s ease",
          borderRadius: "8px",
          margin: "4px 0",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <ListItemAvatar>
          <Avatar
            src={participant.avatar}
            sx={{
              border: isSpeaking ? "2px solid #27ae60" : "none",
              transition: "all 0.2s ease",
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={participant.username}
          primaryTypographyProps={{
            fontWeight: isSpeaking ? 600 : 400,
          }}
        />
        {participant._id !== user?._id && (
          <IconButton
            size="small"
            sx={{
              color: "#b0b3b8",
              "&:hover": { color: "#ff9800", bgcolor: "transparent" },
            }}
            onClick={() => openReportModal(participant, "user")}
          >
            <ReportIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
    );
  };

  const MicButton = () => (
    <IconButton
      onClick={handleToggleMic}
      disabled={isQueueBasedDiscussion && !isMyTurn}
      sx={{
        width: 80,
        height: 80,
        bgcolor: isMicActive ? "#27ae60" : "#e74c3c",
        color: "white",
        "&:hover": {
          bgcolor: isMicActive ? "#219150" : "#c0392b",
        },
        "@keyframes pulse": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.2)", opacity: 0.5 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "@keyframes vibrate": {
          "0%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(2px)" },
          "75%": { transform: "translateX(-2px)" },
          "100%": { transform: "translateX(0)" },
        },
        "&::before":
          isMicActive && isLocalSpeaking
            ? {
                content: '""',
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: "2px solid #27ae60",
                animation: "pulse 1s ease-out infinite",
              }
            : {},
      }}
    >
      {isMicActive ? (
        <MicIcon
          sx={{
            fontSize: 40,
            animation: isLocalSpeaking
              ? "vibrate 0.3s linear infinite"
              : "none",
          }}
        />
      ) : (
        <MicOffIcon sx={{ fontSize: 40 }} />
      )}
    </IconButton>
  );

  ParticipantItem.propTypes = {
    participant: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <Navigation />
      <Container maxWidth="lg" sx={{ pt: 10, pb: 4 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Paper
            sx={{ width: 280, p: 3, borderRadius: 2, alignSelf: "flex-start" }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 3 }}
            >
              <GroupIcon />
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                Participants ({participants.length})
              </Typography>
            </Stack>
            <List>
              {participants.map((participant) => (
                <ParticipantItem
                  key={participant._id || participant.id}
                  participant={participant}
                />
              ))}
            </List>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLeaveDiscussion}
              sx={{
                mt: 2,
                borderColor: "error.main",
                color: "error.main",
                "&:hover": {
                  borderColor: "error.dark",
                  bgcolor: "error.lighter",
                },
              }}
            >
              Leave Discussion
            </Button>
          </Paper>

          <Paper sx={{ flex: 1, p: 4, borderRadius: 2 }}>
            {currentDiscussion && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{ fontWeight: 700, flex: 1 }}
                  >
                    {currentDiscussion.title}
                  </Typography>
                  <IconButton
                    size="medium"
                    sx={{
                      color: "#b0b3b8",
                      ml: 1,
                      "&:hover": { color: "#ff9800", bgcolor: "transparent" },
                    }}
                    onClick={() =>
                      openReportModal(currentDiscussion, "discussion")
                    }
                  >
                    <ReportIcon fontSize="medium" />
                  </IconButton>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                  <Chip
                    icon={<CategoryIcon />}
                    label={currentDiscussion.topic}
                    size="small"
                  />
                  <Chip
                    label={currentDiscussion.type}
                    size="small"
                    color={
                      currentDiscussion.type?.toLowerCase() === "free talk"
                        ? "secondary"
                        : "primary"
                    }
                  />
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, whiteSpace: "pre-wrap" }}
                >
                  {currentDiscussion.description}
                </Typography>
              </>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <MicButton />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {isMicActive ? "Mic On" : "Mic Off"}
                {isQueueBasedDiscussion && !isMyTurn && " (Not your turn)"}
              </Typography>
            </Box>

            {isQueueBasedDiscussion && (
              <>
                <Button
                  variant="contained"
                  onClick={handleToggleQueue}
                  disabled={!user}
                  sx={{
                    display: "block",
                    mx: "auto",
                    mb: 4,
                    px: 3,
                    py: 1.5,
                    bgcolor: userInSpeakingQueue ? "error.main" : "#000",
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: userInSpeakingQueue ? "error.dark" : "#222",
                      transform: "translateY(-1px)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  {userInSpeakingQueue
                    ? "Leave Speaking Queue"
                    : "Join Speaking Queue"}
                </Button>

                {speakingQueue.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 2, textAlign: "center" }}
                    >
                      Speaking Queue
                    </Typography>
                    <List sx={{ bgcolor: "#f8f9fa", borderRadius: 2, p: 2 }}>
                      {speakingQueue.map((speaker, index) => (
                        <ListItem
                          key={speaker._id || speaker.id}
                          sx={{
                            bgcolor: index === 0 ? "#fff" : "transparent",
                            borderRadius: 2,
                            mb: 1,
                            boxShadow:
                              index === 0
                                ? "0 2px 4px rgba(0,0,0,0.05)"
                                : "none",
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={speaker.avatar}
                              sx={{
                                bgcolor: index === 0 ? "#000" : "#666",
                                width: 40,
                                height: 40,
                              }}
                            >
                              {speaker.name
                                ? speaker.name[0]
                                : speaker.username
                                ? speaker.username[0]
                                : "?"}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<UserNameWithRole user={speaker} />}
                            secondary={
                              index === 0
                                ? "Currently Speaking"
                                : `#${index + 1} in queue`
                            }
                            primaryTypographyProps={{
                              fontWeight: index === 0 ? 600 : 400,
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Box>
      </Container>

      <Fab
        aria-label="chat"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: "#fff",
          color: "#000",
          border: "2px solid #000",
          "&:hover": {
            bgcolor: "#f5f5f5",
            color: "#222",
            borderColor: "#222",
          },
        }}
        onClick={() => setIsChatOpen(true)}
      >
        <ChatIcon sx={{ color: "#000" }} />
      </Fab>

      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        PaperProps={{
          sx: {
            width: 360,
            bgcolor: "background.default",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Discussion Chat
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
            {isLoadingChatMessages ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {chatMessages.map((msg) => (
                  <ListItem
                    key={msg._id}
                    alignItems="flex-start"
                    sx={{
                      bgcolor:
                        msg.sender._id === user?._id
                          ? "primary.lighter"
                          : "grey.100",
                      borderRadius: "8px",
                      mb: 1,
                      p: 1.5,
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar src={msg.sender.avatar}>
                        {msg.sender.name
                          ? msg.sender.name[0]
                          : msg.sender.username
                          ? msg.sender.username[0]
                          : "U"}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="bold">
                          {<UserNameWithRole user={msg.sender} />}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            component="span"
                            sx={{ wordBreak: "break-word", display: "block" }}
                          >
                            {msg.text}
                          </Typography>
                          <Typography
                            variant="caption"
                            component="span"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.75rem",
                            }}
                          >
                            {formatMessageTimestamp(msg.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                <div ref={chatMessagesEndRef} />
              </List>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mt: "auto",
              pt: 1,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type a message..."
              value={currentChatMessage}
              onChange={(e) => setCurrentChatMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendChatMessage();
                }
              }}
              sx={{
                mr: 1,
                bgcolor: "background.paper",
                borderRadius: "6px",
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendChatMessage}
              disabled={!currentChatMessage.trim()}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {reportType === "user" ? "Report Participant" : "Report Discussion"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="category-label">Reason</InputLabel>
            <Select
              labelId="category-label"
              value={reportCategory}
              label="Reason"
              onChange={(e) => setReportCategory(e.target.value)}
            >
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="spam">Spam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Description"
            multiline
            minRows={3}
            fullWidth
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 1 }}
          />
          {reportError && (
            <Typography color="error" variant="body2">
              {reportError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)} disabled={reportLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReportSubmit}
            disabled={
              reportLoading ||
              !reportCategory ||
              !reportDescription.trim() ||
              reportDescription.length > 500
            }
            variant="contained"
            sx={{ bgcolor: "#000", color: "#fff" }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          p: 1,
        }}
      >
        <Reactions onReact={handleReaction} />
      </Box>

      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1200,
        }}
      >
        {reactions.map((reaction) => (
          <FloatingReaction
            key={reaction.id}
            type={reaction.type}
            position={reaction.position}
          />
        ))}
      </Box>
    </Box>
  );
}

DiscussionPage.propTypes = {
  participants: PropTypes.array.isRequired,
  currentDiscussion: PropTypes.object.isRequired,
  isMicActive: PropTypes.bool.isRequired,
  handleToggleMic: PropTypes.func.isRequired,
  handleToggleQueue: PropTypes.func.isRequired,
  handleLeaveDiscussion: PropTypes.func.isRequired,
  handleSendChatMessage: PropTypes.func.isRequired,
  userInSpeakingQueue: PropTypes.bool.isRequired,
  formatMessageTimestamp: PropTypes.func.isRequired,
  openReportModal: PropTypes.func.isRequired,
  handleReportSubmit: PropTypes.func.isRequired,
  handleReaction: PropTypes.func.isRequired,
  ParticipantItem: PropTypes.func.isRequired,
  speakingUsers: PropTypes.object.isRequired,
  peers: PropTypes.object.isRequired,
  startVoiceChat: PropTypes.func.isRequired,
  stopVoiceChat: PropTypes.func.isRequired,
  isQueueBasedDiscussion: PropTypes.bool.isRequired,
  isMyTurn: PropTypes.bool.isRequired,
  isFreeTalkType: PropTypes.bool.isRequired,
  isLocalSpeaking: PropTypes.bool.isRequired,
};

export default DiscussionPage;
