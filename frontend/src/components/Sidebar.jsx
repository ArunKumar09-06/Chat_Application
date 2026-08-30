import { useState, useEffect } from "react";
import { Search, LogOut, Camera, MessageSquare } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import UserAvatar from "./UserAvatar";
import ProfileModal from "./ProfileModal";

export default function Sidebar({
  activeConversation,
  onSelectConversation,
  onMobileClose,
}) {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }

  async function handleUserClick(otherUser) {
    setLoadingUserId(otherUser._id);
    try {
      const res = await API.post(`/conversation/with/${otherUser._id}`);
      onSelectConversation(res.data.conversation, otherUser);
      if (onMobileClose) onMobileClose();
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setLoadingUserId(null);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <div
            className="sidebar-avatar-wrapper"
            onClick={() => setShowProfile(true)}
            title="Change profile picture"
          >
            <UserAvatar
              src={user?.profilePicture}
              name={user?.name}
              size={40}
            />
            <div className="avatar-camera-badge">
              <Camera size={12} />
            </div>
          </div>
          <span className="sidebar-username">{user?.name}</span>
        </div>
        <button
          className="icon-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* User list */}
      <div className="sidebar-users">
        {filteredUsers.length === 0 ? (
          <div className="sidebar-empty">
            <MessageSquare size={32} />
            <p>No users found</p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u._id}
              className={`user-item ${
                activeConversation?.otherUser?._id === u._id ? "active" : ""
              } ${loadingUserId === u._id ? "loading" : ""}`}
              onClick={() => handleUserClick(u)}
            >
              <UserAvatar
                src={u.profilePicture}
                name={u.name}
                size={44}
              />
              <div className="user-item-info">
                <span className="user-item-name">{u.name}</span>
                <span className="user-item-email">{u.email}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </aside>
  );
}
