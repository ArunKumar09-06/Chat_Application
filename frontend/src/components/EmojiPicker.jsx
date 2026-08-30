import { useState, useRef, useEffect } from "react";
import { Smile, Heart, ThumbsUp, Sparkles, X } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: Smile,
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
      "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😋", "😛",
      "😜", "🤪", "😝", "🤗", "🤩", "🤔", "🤫", "🤭", "😴", "🤤",
      "😷", "🤒", "🤕", "🤢", "🤮", "😎", "🥳", "🥺", "🤠", "😭",
    ],
  },
  {
    name: "Gestures",
    icon: ThumbsUp,
    emojis: [
      "👍", "👎", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈",
      "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤝",
      "🙏", "👏", "🙌", "👐", "💪", "👊", "✊", "🤛", "🤜", "✍️",
    ],
  },
  {
    name: "Hearts & Fun",
    icon: Heart,
    emojis: [
      "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
      "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🔥", "✨",
      "🌟", "⭐", "💥", "🎉", "🎊", "🚀", "💯", "👑", "🎯", "⚡",
    ],
  },
  {
    name: "Objects & Vibe",
    icon: Sparkles,
    emojis: [
      "👀", "👁️", "🧠", "💀", "👻", "👽", "🤖", "💩", "🍻", "🥂",
      "🍷", "☕", "🍕", "🍔", "🍟", "🍩", "🎂", "🎮", "🎧", "🎬",
    ],
  },
];

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="emoji-picker-popover" ref={pickerRef}>
      {/* Category Tabs Header */}
      <div className="emoji-picker-header">
        <div className="emoji-category-tabs">
          {EMOJI_CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                className={`emoji-tab-btn ${activeCategory === idx ? "active" : ""}`}
                onClick={() => setActiveCategory(idx)}
                title={cat.name}
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="emoji-close-btn"
          onClick={onClose}
          title="Close emoji picker"
        >
          <X size={14} />
        </button>
      </div>

      {/* Category Title */}
      <div className="emoji-category-title">
        {EMOJI_CATEGORIES[activeCategory].name}
      </div>

      {/* Emoji Grid */}
      <div className="emoji-grid">
        {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
          <button
            key={i}
            type="button"
            className="emoji-item-btn"
            onClick={() => onSelectEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
