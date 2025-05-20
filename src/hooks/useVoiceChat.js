import { useEffect, useRef, useState } from "react";

export const useVoiceChat = (socket, discussionId) => {
  const [peers, setPeers] = useState({});
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
      ],
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
        setSpeakingUsers((prev) => new Set(prev).add(userId));
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
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);

      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      const checkAudioLevel = () => {
        if (!localStreamRef.current) return;
        analyzer.getByteFrequencyData(dataArray);
        const audioLevel = dataArray.reduce((a, b) => a + b) / dataArray.length;

        if (audioLevel > 10) {
          setIsLocalSpeaking(true);
          console.log("Local audio level:", audioLevel.toFixed(2));
        } else {
          setIsLocalSpeaking(false);
        }
        requestAnimationFrame(checkAudioLevel);
      };
      checkAudioLevel();

      socket.emit("ready-to-connect", { discussionId });
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopVoiceChat = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    setPeers({});
    console.log("Voice chat stopped and cleaned up.");
  };

  useEffect(() => {
    if (!socket) return;

    const handleUserReady = async ({ userId }) => {
      if (socket.id === userId) return;
      try {
        const pc = createPeerConnection(userId);
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
        if (peerConnections.current[userId] && candidate) {
          await peerConnections.current[userId].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } else {
          console.warn(
            `No peer connection or candidate for ${userId} to add ICE candidate.`
          );
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
  }, [socket, discussionId]);

  return {
    startVoiceChat,
    stopVoiceChat,
    peers,
    speakingUsers,
    isLocalSpeaking,
  };
};
