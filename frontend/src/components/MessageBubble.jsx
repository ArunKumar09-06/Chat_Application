import { useAuth } from "../context/AuthContext";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const isOwn = message.sender?._id === user?.id || message.sender === user?.id;

  function formatTime(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
      <div className="message-content">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
