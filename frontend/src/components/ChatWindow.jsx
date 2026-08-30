import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, MessageSquareDashed } from "lucide-react";
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
  const joinedRef = useRef(null);

  // Fetch messages and join socket room when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    setMessages([]);
    setLoading(true);

    // Fetch existing messages
    API.get(`/messages/${conversation._id}`)
      .then((res) => {
        setMessages(res.data.messages);
      })
      .catch((err) => {
        console.error("Failed to fetch messages:", err);
      })
      .finally(() => {
        setLoading(false);
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
      // Only add if it belongs to the current conversation
      if (
        message.conversation === conversation?._id ||
        message.conversation?._id === conversation?._id
      ) {
        setMessages((prev) => {
          // Prevent duplicates
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
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !conversation?._id || sending) return;

    setSending(true);
    setNewMessage("");

    try {
      // Send via socket for real-time delivery
      if (socket && socket.connected) {
        socket.emit(
          "send-message",
          { conversationId: conversation._id, text },
          (response) => {
            if (!response.success) {
              console.error("Socket send failed:", response.message);
            }
          }
        );
      } else {
        // Fallback to REST API
        await API.post("/messages/", {
          conversationId: conversation._id,
          text,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setNewMessage(text); // Restore on failure
    } finally {
      setSending(false);
    }
  }

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="empty-state">
          <MessageSquareDashed size={64} strokeWidth={1} />
          <h2>Welcome to ChatApp</h2>
          <p>Select a user from the sidebar to start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        <button className="icon-btn back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <UserAvatar
          src={otherUser?.profilePicture}
          name={otherUser?.name}
          size={36}
        />
        <div className="chat-header-info">
          <span className="chat-header-name">{otherUser?.name}</span>
          <span className="chat-header-email">{otherUser?.email}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">
            <div className="spinner" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-no-messages">
            <p>No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={!newMessage.trim() || sending}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
