import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { user } = useAuth();
  const socket = useSocket(user);
  const [activeConversation, setActiveConversation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  function handleSelectConversation(conversation, otherUser) {
    setActiveConversation({ conversation, otherUser });
    // On mobile, hide sidebar when a conversation is selected
    setShowSidebar(false);
  }

  function handleBack() {
    setShowSidebar(true);
    setActiveConversation(null);
  }

  return (
    <div className="chat-layout">
      <div className={`sidebar-wrapper ${showSidebar ? "visible" : ""}`}>
        <Sidebar
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onMobileClose={() => setShowSidebar(false)}
        />
      </div>
      <div
        className={`chat-window-wrapper ${!showSidebar ? "visible" : ""}`}
      >
        <ChatWindow
          conversation={activeConversation?.conversation}
          otherUser={activeConversation?.otherUser}
          socket={socket}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
