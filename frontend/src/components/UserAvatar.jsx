import { useState } from "react";

const BACKEND_URL = "http://localhost:5000";

// Curated avatar gradient palettes based on name
const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #0ea5e9, #2563eb)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #8b5cf6, #6d28d9)",
  "linear-gradient(135deg, #ec4899, #db2777)",
  "linear-gradient(135deg, #14b8a6, #0f766e)",
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
];

function getGradientForName(name) {
  if (!name) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export default function UserAvatar({
  src,
  name,
  size = 40,
  className = "",
  showStatus = false,
  isOnline = false,
}) {
  const [hasError, setHasError] = useState(false);

  const initials = name
    ? name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  }

  const imageUrl = getImageUrl(src);
  const showFallback = !imageUrl || hasError;

  return (
    <div
      className={`user-avatar-container ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      <div
        className="user-avatar"
        style={{
          width: size,
          height: size,
          background: showFallback ? getGradientForName(name) : undefined,
        }}
      >
        {!showFallback ? (
          <img
            src={imageUrl}
            alt={name || "User"}
            onError={() => setHasError(true)}
            className="avatar-img"
          />
        ) : (
          <span
            className="avatar-fallback"
            style={{ fontSize: Math.max(12, size * 0.36) }}
          >
            {initials}
          </span>
        )}
      </div>

      {showStatus && (
        <span
          className={`avatar-status-dot ${isOnline ? "online" : "offline"}`}
          style={{
            width: Math.max(8, size * 0.25),
            height: Math.max(8, size * 0.25),
          }}
        />
      )}
    </div>
  );
}
