import { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  MessageSquareDashed,
  Smile,
  Paperclip,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import API from "../api/axios";
import MessageBubble from "./MessageBubble";
import UserAvatar from "./UserAvatar";

export default function ChatWindow({
  conversation,
  otherUser,
  socket,
  onBack,
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const joinedRef = useRef(null);

  // Fetch messages and join socket room when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    setMessages([]);
    setLoading(true);

    // Fetch existing messages
    API.get(`/messages/${conversation._id}`)
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
      })
      .finally(() => {
        setLoading(false);
        // Focus input field when chat opens
        setTimeout(() => inputRef.current?.focus(), 100);
      });

    // Join socket room function
    const joinRoom = () => {
      if (socket && socket.connected && conversation?._id) {
        socket.emit("join-conversation", conversation._id, (response) => {
          if (response?.success) {
            joinedRef.current = conversation._id;
          } else {
            console.error("Failed to join room:", response?.message);
          }
        });
      }
    };

    if (socket) {
      if (socket.connected) {
        joinRoom();
      }
      socket.on("connect", joinRoom);
      return () => {
        socket.off("connect", joinRoom);
      };
    }
  }, [conversation?._id, socket]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    function handleNewMessage(message) {
      if (
        message.conversation === conversation?._id ||
        message.conversation?._id === conversation?._id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    }

    socket.on("new-message", handleNewMessage);
    return () => socket.off("new-message", handleNewMessage);
  }, [socket, conversation?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !conversation?._id || sending) return;

    setSending(true);
    setNewMessage("");

    try {
      if (socket && socket.connected) {
        socket.emit(
          "send-message",
          { conversationId: conversation._id, text },
          (response) => {
            if (!response?.success) {
              console.error("Socket send failed:", response?.message);
            }
          }
        );
      } else {
        await API.post("/messages/", {
          conversationId: conversation._id,
          text,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="empty-state-hero">
          <div className="empty-icon-glow">
            <MessageSquareDashed size={48} className="empty-hero-icon" />
          </div>
          <h2>Welcome to your chats</h2>
          <p>
            Select a conversation from the sidebar or find a teammate to begin
            real-time messaging.
          </p>
          <div className="empty-features-pills">
            <span className="feature-pill">
              <ShieldCheck size={14} /> End-to-end encrypted
            </span>
            <span className="feature-pill">
              <Sparkles size={14} /> Real-time sync
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        <button
          className="icon-btn back-btn"
          onClick={onBack}
          title="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>

        <UserAvatar
          src={otherUser?.profilePicture}
          name={otherUser?.name}
          size={42}
          showStatus={true}
          isOnline={true}
        />

        <div className="chat-header-info">
          <span className="chat-header-name">{otherUser?.name || "Chat"}</span>
          <div className="chat-header-status">
            <span className="status-indicator-dot" />
            <span className="status-text">Active now</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="chat-messages">
        <div className="chat-date-separator">
          <span>Conversation Started</span>
        </div>

        {loading ? (
          <div className="chat-loading">
            <div className="spinner" />
            <p>Fetching messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-no-messages">
            <div className="no-messages-bubble">
              <Sparkles size={20} className="sparkle-icon" />
              <p>This is the start of your message history with <strong>{otherUser?.name}</strong>.</p>
              <span>Say hello! 👋</span>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input bar */}
      <form className="chat-input-container" onSubmit={handleSend}>
        <div className="chat-input-bar">
          <button
            type="button"
            className="input-action-btn"
            title="Emoji"
            onClick={() => setNewMessage((prev) => prev + " 😊")}
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            className="input-action-btn"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            autoFocus
          />

          <button
            type="submit"
            className={`send-btn ${newMessage.trim() ? "active" : ""}`}
            disabled={!newMessage.trim() || sending}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
