import { useState, useEffect, useRef } from "react";
import {
  Send,
  ArrowLeft,
  MessageSquareDashed,
  Smile,
  ShieldCheck,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
} from "lucide-react";
import API from "../api/axios";
import MessageBubble from "./MessageBubble";
import UserAvatar from "./UserAvatar";
import EmojiPicker from "./EmojiPicker";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const joinedRef = useRef(null);

  // Fetch messages and join socket room when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    setMessages([]);
    setLoading(true);
    setShowEmojiPicker(false);

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

  function handleEmojiSelect(emoji) {
    if (!inputRef.current) {
      setNewMessage((prev) => prev + emoji);
      return;
    }
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const updated = newMessage.substring(0, start) + emoji + newMessage.substring(end);
    setNewMessage(updated);
    
    // Restore cursor position after inserted emoji
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }

  async function handleSend(e) {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || !conversation?._id || sending) return;

    setSending(true);
    setNewMessage("");
    setShowEmojiPicker(false);

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

  // Quick reactions array
  const quickEmojis = ["👍", "❤️", "😂", "🔥", "🎉", "👏"];

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="empty-state-hero">
          <div className="empty-icon-glow">
            <MessageSquareDashed size={52} className="empty-hero-icon" />
          </div>
          <h2>Welcome to your chats</h2>
          <p>
            Select a contact from the left panel to begin an instant, end-to-end
            encrypted real-time conversation.
          </p>
          <div className="empty-features-pills">
            <span className="feature-pill">
              <ShieldCheck size={14} /> End-to-end encrypted
            </span>
            <span className="feature-pill">
              <Sparkles size={14} /> Real-time WebSocket sync
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
          size={44}
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

        <div className="chat-header-actions">
          <button className="icon-btn" title="Voice call">
            <Phone size={18} />
          </button>
          <button className="icon-btn" title="Video call">
            <Video size={18} />
          </button>
          <button className="icon-btn" title="More options">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages Stream with Subtle Doodle Wallpaper */}
      <div className="chat-messages-container">
        <div className="chat-messages">
          <div className="chat-date-separator">
            <span>Conversation Started</span>
          </div>

          {loading ? (
            <div className="chat-loading">
              <div className="spinner" />
              <p>Fetching conversation messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-no-messages">
              <div className="no-messages-bubble">
                <div className="sparkle-circle">
                  <Sparkles size={24} className="sparkle-icon" />
                </div>
                <h3>Start of history</h3>
                <p>
                  No messages exchanged with <strong>{otherUser?.name}</strong> yet.
                </p>
                <div className="quick-start-reactions">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="quick-emoji-pill"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg._id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Message input bar */}
      <form className="chat-input-container" onSubmit={handleSend}>
        <div className="chat-input-bar">
          <button
            type="button"
            className={`input-action-btn ${showEmojiPicker ? "active" : ""}`}
            title="Emoji Picker"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile size={20} />
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
            title="Send message (Enter)"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
