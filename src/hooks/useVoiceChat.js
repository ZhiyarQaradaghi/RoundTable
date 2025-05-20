import { useEffect, useRef, useState } from "react";

export const useVoiceChat = (socket, discussionId) => {
  const [peers, setPeers] = useState({});
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const [iceServers, setIceServers] = useState(null);
  const pendingIceCandidates = useRef({});

  useEffect(() => {
    const fetchIceServers = async () => {
      try {
        const response = await fetch(
          "https://roundtable.metered.live/api/v1/turn/credentials?apiKey=5463bf6ecbbb11d1baaf23d2c6280f36e648"
        );
        const servers = await response.json();
        setIceServers(servers);
      } catch (error) {
        console.error("Error fetching ICE servers:", error);
        setIceServers([
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ]);
      }
    };
    fetchIceServers();
  }, []);

  const createPeerConnection = (targetUserId) => {
    if (!iceServers) return null;
    const pc = new RTCPeerConnection({
      iceServers: iceServers,
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          targetUserId,
          discussionId,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.track.kind === "audio") {
        setPeers((prev) => {
          const stream = prev[targetUserId] || new MediaStream();
          if (!stream.getTracks().find((t) => t.id === event.track.id)) {
            stream.addTrack(event.track);
          }
          return {
            ...prev,
            [targetUserId]: stream,
          };
        });

        if (
          event.streams &&
          event.streams[0] &&
          event.streams[0].getAudioTracks().length > 0
        ) {
          checkAudioLevel(new AudioContext(), event.streams[0], targetUserId);
        } else {
          console.warn(
            `No valid stream in ontrack event.streams[0] for ${targetUserId} to check audio level.`
          );
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state for ${targetUserId}: ${pc.iceConnectionState}`
      );
      if (pc.iceConnectionState === "failed") {
        console.log(
          `ICE failed for ${targetUserId}, attempting to restart ICE.`
        );
        pc.restartIce();
      }
    };

    // Add any pending ICE candidates that arrived before the PC was created
    if (pendingIceCandidates.current[targetUserId]) {
      const candidates = pendingIceCandidates.current[targetUserId];
      candidates.forEach(async (candidate) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`Added pending ICE candidate for ${targetUserId}`);
        } catch (err) {
          console.error(
            `Error adding pending ICE candidate for ${targetUserId}:`,
            err
          );
        }
      });
      delete pendingIceCandidates.current[targetUserId];
    }

    return pc;
  };

  const checkAudioLevel = (audioContext, stream, userId, isLocal = false) => {
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 1024;
    analyzer.smoothingTimeConstant = 0.3;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyzer);
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);

    const checkLevel = () => {
      analyzer.getByteFrequencyData(dataArray);
      const audioLevel = dataArray.reduce((a, b) => a + b) / dataArray.length;

      if (audioLevel > 10) {
        setSpeakingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.add(userId);
          return newSet;
        });
        if (isLocal) setIsLocalSpeaking(true);
        setTimeout(() => {
          setSpeakingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
          if (isLocal) setIsLocalSpeaking(false);
        }, 300);
      }
      requestAnimationFrame(checkLevel);
    };
    checkLevel();
  };

  const startVoiceChat = async () => {
    if (!iceServers) {
      console.log("Waiting for ICE servers...");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      console.log("Local stream obtained:", mediaStream.id);
      localStreamRef.current = mediaStream;

      const audioContext = new AudioContext();
      checkAudioLevel(audioContext, mediaStream, socket.id, true);

      socket.emit("ready-to-connect", { discussionId });
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopVoiceChat = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    setPeers({});
    setIsLocalSpeaking(false);
    console.log("Voice chat stopped and cleaned up.");
  };

  useEffect(() => {
    if (!socket || !iceServers) return;

    const handleUserReady = async ({ userId }) => {
      if (socket.id === userId) return;
      try {
        const pc = createPeerConnection(userId);
        if (!pc) return;
        peerConnections.current[userId] = pc;
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit("voice-offer", {
          offer,
          targetUserId: userId,
          discussionId,
        });
      } catch (error) {
        console.error(`Error creating offer for ${userId}:`, error);
      }
    };

    const handleVoiceOffer = async ({ offer, userId }) => {
      console.log(`Received voice offer from ${userId}.`);
      try {
        const pc = createPeerConnection(userId);
        if (!pc) return;
        peerConnections.current[userId] = pc;

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("voice-answer", {
          answer,
          targetUserId: userId,
          discussionId,
        });
      } catch (error) {
        console.error(`Error handling offer from ${userId}:`, error);
      }
    };

    const handleVoiceAnswer = async ({ answer, userId }) => {
      console.log(`Received voice answer from ${userId}.`);
      try {
        if (peerConnections.current[userId]) {
          await peerConnections.current[userId].setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        } else {
          console.warn(`No peer connection found for ${userId} to set answer.`);
        }
      } catch (error) {
        console.error(`Error setting remote answer from ${userId}:`, error);
      }
    };

    const handleIceCandidate = async ({ candidate, userId }) => {
      console.log(`Received ICE candidate from ${userId}.`);
      try {
        if (peerConnections.current[userId]) {
          await peerConnections.current[userId].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          if (!pendingIceCandidates.current[userId]) {
            pendingIceCandidates.current[userId] = [];
          }
          pendingIceCandidates.current[userId].push(candidate);
          console.log(`Stored pending ICE candidate for ${userId}`);
        }
      } catch (error) {
        console.error(`Error adding ICE candidate from ${userId}:`, error);
      }
    };

    socket.on("user-ready", handleUserReady);
    socket.on("voice-offer", handleVoiceOffer);
    socket.on("voice-answer", handleVoiceAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      console.log("Cleaning up voice chat socket listeners.");
      socket.off("user-ready", handleUserReady);
      socket.off("voice-offer", handleVoiceOffer);
      socket.off("voice-answer", handleVoiceAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      stopVoiceChat();
    };
  }, [socket, discussionId, iceServers]);

  return {
    startVoiceChat,
    stopVoiceChat,
    peers,
    speakingUsers,
    isLocalSpeaking,
  };
};
