import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2, Loader2, MessageCircle } from "lucide-react";
import { Room, RoomEvent, Track } from "livekit-client";
import { base44 } from "@/api/base44Client";

const STATES = {
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
};

export default function ZHSVoiceButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(STATES.IDLE);
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [error, setError] = useState(null);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const roomRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  const connect = async () => {
    setStatus(STATES.CONNECTING);
    setError(null);
    setTranscript([]);

    try {
      const res = await base44.functions.invoke("voiceToken", {});
      const { livekit_url, token } = res.data;

      if (!livekit_url || !token) throw new Error("Invalid token response");

      const room = new Room();
      roomRef.current = room;

      // Handle agent audio tracks
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          track.attach();
          setAgentSpeaking(true);
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach();
          setAgentSpeaking(false);
        }
      });

      // Handle data channel messages (transcript + heartbeat)
      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text);

          if (data.type === "client_action") {
            if (data.action === "heartbeat") {
              // Send heartbeat ack
              const ack = JSON.stringify({
                type: "client_action",
                action: "heartbeat_ack",
                payload: { timestamp: data.payload.timestamp },
              });
              room.localParticipant?.publishData(
                new TextEncoder().encode(ack),
                { reliable: true, topic: "client_actions" }
              );
            } else if (data.action === "send_transcript") {
              const { role, text: msgText } = data.payload;
              setTranscript((prev) => [...prev, { role, text: msgText }]);
            }
          }
        } catch (_) {}
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus(STATES.IDLE);
        setAgentSpeaking(false);
      });

      await room.connect(livekit_url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      setStatus(STATES.CONNECTED);
    } catch (err) {
      setError(err.message || "Connection failed");
      setStatus(STATES.ERROR);
    }
  };

  const disconnect = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setStatus(STATES.IDLE);
    setMuted(false);
    setAgentSpeaking(false);
  };

  const toggleMic = async () => {
    if (!roomRef.current) return;
    const newMuted = !muted;
    await roomRef.current.localParticipant?.setMicrophoneEnabled(!newMuted);
    setMuted(newMuted);
  };

  const handleClose = () => {
    disconnect();
    setOpen(false);
    setTranscript([]);
    setError(null);
  };

  const isConnected = status === STATES.CONNECTED;
  const isConnecting = status === STATES.CONNECTING;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 rounded-2xl bg-card border border-border/60 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : isConnecting ? "bg-amber-400 animate-pulse" : "bg-muted-foreground/40"}`} />
                <span className="text-sm font-semibold text-foreground">ZHS Voice Assistant</span>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript */}
            <div className="h-48 overflow-y-auto px-4 py-3 space-y-2 bg-background/50">
              {transcript.length === 0 && !isConnected && !isConnecting && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/60 text-xs gap-1">
                  <Volume2 className="w-6 h-6 mb-1 opacity-40" />
                  <p>Click "Start" to connect to your ZHS assistant</p>
                  <p className="opacity-60 text-xs italic">"{'"'}Hey, I can help you manage agents, check status, or handle workflows.{'"'}"</p>
                </div>
              )}
              {isConnecting && transcript.length === 0 && (
                <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to ZHS Voice...
                </div>
              )}
              {transcript.map((entry, i) => (
                <div key={i} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-xs leading-relaxed ${
                    entry.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}>
                    {entry.text}
                  </div>
                </div>
              ))}
              {error && (
                <div className="px-3 py-2 rounded-xl bg-red-400/10 border border-red-400/20 text-xs text-red-400 text-center">
                  {error}
                </div>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Controls */}
            <div className="px-4 py-3 border-t border-border/40 bg-secondary/10 flex items-center gap-2">
              {!isConnected && !isConnecting && (
                <button
                  onClick={connect}
                  className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Start Voice Chat
                </button>
              )}
              {isConnecting && (
                <button disabled className="flex-1 py-2 rounded-xl bg-primary/50 text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Connecting...
                </button>
              )}
              {isConnected && (
                <>
                  <button
                    onClick={toggleMic}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                      muted
                        ? "bg-red-400/10 border-red-400/30 text-red-400 hover:bg-red-400/20"
                        : "bg-green-400/10 border-green-400/30 text-green-400 hover:bg-green-400/20"
                    }`}
                  >
                    {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    {muted ? "Unmute" : "Mute"}
                  </button>
                  {agentSpeaking && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Speaking</span>
                    </div>
                  )}
                  <button
                    onClick={disconnect}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    End
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
          isConnected
            ? "bg-green-500 hover:bg-green-400"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isConnected && (
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-30 animate-ping" />
        )}
        <MessageCircle className="w-6 h-6 text-white" />
        {isConnected && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-background" />
        )}
      </motion.button>
    </div>
  );
}