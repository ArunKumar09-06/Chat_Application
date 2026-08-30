import { useState, useEffect } from "react";
import {
  Search,
  LogOut,
  Camera,
  MessageSquare,
  X,
  Users,
  MoreVertical,
  User,
} from "lucide-react";
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'online'
  const [showProfile, setShowProfile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoadingUsers(true);
    try {
      const res = await API.get("/auth/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoadingUsers(false);
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

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" ? true : u.isOnline;
    return matchesSearch && matchesTab;
  });

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-user-info">
          <div
            className="sidebar-avatar-wrapper"
            onClick={() => setShowProfile(true)}
            title="Click to change profile picture"
          >
            <UserAvatar
              src={user?.profilePicture}
              name={user?.name}
              size={42}
              showStatus={true}
              isOnline={true}
            />
            <div className="avatar-camera-badge">
              <Camera size={11} />
            </div>
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-username">{user?.name || "User"}</span>
            <span className="sidebar-status-tag">Available</span>
          </div>
        </div>

        <div className="sidebar-header-actions">
          <div className="dropdown-container">
            <button
              className="icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Menu"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div
                className="dropdown-menu"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowProfile(true);
                    setShowMenu(false);
                  }}
                >
                  <User size={15} />
                  <span>Edit Profile</span>
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search or start new chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sidebar-tabs-bar">
        <button
          className={`sidebar-tab-pill ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Chats
          <span className="tab-count">{users.length}</span>
        </button>
        <button
          className={`sidebar-tab-pill ${activeTab === "online" ? "active" : ""}`}
          onClick={() => setActiveTab("online")}
        >
          Active
        </button>
      </div>

      {/* User list */}
      <div className="sidebar-users">
        {loadingUsers ? (
          <div className="sidebar-skeletons">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="user-skeleton-item">
                <div className="skeleton-avatar" />
                <div className="skeleton-info">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line long" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="sidebar-empty">
            <div className="empty-icon-circle">
              <MessageSquare size={24} />
            </div>
            <h4>No conversations found</h4>
            <p>
              {searchQuery
                ? `No user matching "${searchQuery}"`
                : "No other users registered yet"}
            </p>
            {searchQuery && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isActive =
              activeConversation?.otherUser?._id === u._id ||
              activeConversation?.otherUser?.id === u._id;
            const isLoading = loadingUserId === u._id;

            return (
              <div
                key={u._id}
                className={`user-item ${isActive ? "active" : ""} ${
                  isLoading ? "loading" : ""
                }`}
                onClick={() => handleUserClick(u)}
              >
                <UserAvatar
                  src={u.profilePicture}
                  name={u.name}
                  size={46}
                  showStatus={true}
                  isOnline={u.isOnline ?? false}
                />
                <div className="user-item-info">
                  <div className="user-item-header">
                    <span className="user-item-name">{u.name}</span>
                  </div>
                  <div className="user-item-sub">
                    <span className="user-item-email">{u.email}</span>
                  </div>
                </div>
                {isActive && <div className="active-indicator" />}
              </div>
            );
          })
        )}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </aside>
  );
}
