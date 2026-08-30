const BACKEND_URL = "http://localhost:5000";

export default function UserAvatar({ src, name, size = 40, className = "" }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  function getImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    // Remove leading slash if present
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
  }

  const imageUrl = getImageUrl(src);

  return (
    <div
      className={`user-avatar ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "User"}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className="avatar-fallback"
        style={{
          display: imageUrl ? "none" : "flex",
          fontSize: size * 0.38,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
