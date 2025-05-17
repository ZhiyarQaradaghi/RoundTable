import { useEffect, useRef, useState } from "react";

export const useVoiceChat = (socket, discussionId) => {
  const [peers, setPeers] = useState({});
  const localStreamRef = useRef(null);
  const peerConnections = useRef({});

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
      iceTransportPolicy: "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });

    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        console.log(
          "Adding audio track from localStreamRef:",
          audioTrack.label,
          audioTrack.enabled
        );
        pc.addTrack(audioTrack, localStreamRef.current);
      } else {
        console.warn("No audio track found in localStreamRef.current");
      }
    } else {
      console.warn("localStreamRef.current is null in createPeerConnection");
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
      console.log(
        "Received remote track:",
        event.track.kind,
        event.track.readyState,
        "for user:",
        targetUserId
      );
      if (event.track.kind === "audio") {
        const remoteStream = new MediaStream([event.track]);
        setPeers((prev) => ({
          ...prev,
          [targetUserId]: remoteStream,
        }));
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state for ${targetUserId}:`,
        pc.iceConnectionState
      );
      if (pc.iceConnectionState === "failed") {
        console.log(`ICE failed for ${targetUserId}, restarting ICE`);
        pc.restartIce();
      }
    };

    pc.onsignalingstatechange = () => {
      console.log(`Signaling state for ${targetUserId}:`, pc.signalingState);
    };

    return pc;
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
        if (audioLevel > 0.1) {
          console.log("Local audio level:", audioLevel.toFixed(2));
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
      localStreamRef.current = null;
    }
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
    setPeers({});
    console.log("Voice chat stopped and cleaned up.");
  };

  useEffect(() => {
    if (!socket) return;

    const handleUserReady = async ({ userId }) => {
      console.log(`User ${userId} is ready. Creating offer.`);
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

  return { startVoiceChat, stopVoiceChat, peers };
};
