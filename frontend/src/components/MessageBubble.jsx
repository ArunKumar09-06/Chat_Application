import { CheckCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isOwn =
    message.sender?._id === user?.id ||
    message.sender === user?.id ||
    message.sender?._id === user?._id ||
    message.sender === user?._id;

  function formatTime(dateStr) {
    if (!dateStr) {
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className={`message-bubble-wrapper ${isOwn ? "own" : "other"}`}>
      <div className="message-bubble">
        <p className="message-text">{message.text}</p>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <CheckCheck size={14} className="message-status-icon read" />
          )}
        </div>
      </div>
    </div>
  );
}
