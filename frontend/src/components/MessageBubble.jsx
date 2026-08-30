import { useState } from "react";
import { CheckCheck, Copy, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MessageBubble({ message }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className={`message-bubble-wrapper ${isOwn ? "own" : "other"}`}>
      <div className="message-bubble">
        {/* Copy button on hover */}
        <button
          className="message-action-btn"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy message"}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>

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
