// src/App.js
import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import ChatMain from "./Components/ChatMain";
import GroupCreateModal from "./Components/GroupCreateModal";
import { createMockSocket } from "./Components/mockSocket";
import "./Components/chat.css";

const INITIAL_USERS = [
  {
    id: "admin1",
    name: "Admin User",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    online: true,
    role: "admin",
    status: "active"
  },
  {
    id: "u1",
    name: "Alice Johnson",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u2",
    name: "Bob Lee",
    avatar: "https://randomuser.me/api/portraits/men/34.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u3",
    name: "Clara Smith",
    avatar: "https://randomuser.me/api/portraits/women/81.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u4",
    name: "David Kim",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u5",
    name: "Eva Chen",
    avatar: "https://randomuser.me/api/portraits/women/50.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u6",
    name: "Frank Martinez",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u7",
    name: "Grace Lin",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u8",
    name: "Henry Ford",
    avatar: "https://randomuser.me/api/portraits/men/13.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u9",
    name: "Ivy Wang",
    avatar: "https://randomuser.me/api/portraits/women/92.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u10",
    name: "Jake Paul",
    avatar: "https://randomuser.me/api/portraits/men/60.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u11",
    name: "Karen O'Neil",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    online: true,
    role: "user",
    status: "active"
  },
  {
    id: "u12",
    name: "Luke Brown",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    online: true,
    role: "user",
    status: "active"
  }
];

export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("dm");
  const [dmMessages, setDmMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [inputText, setInputText] = useState("");

  // Group modal state
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  // Socket
  const socket = useRef(null);
  useEffect(() => {
    socket.current = createMockSocket();
    socket.current.on("update_users", setUsers);
    socket.current.on("group_list", setGroups);
    socket.current.on("dm_message", msg => {
      const peer = msg.from === socket.current.id ? msg.to : msg.from;
      setDmMessages(prev => ({
        ...prev,
        [peer]: [...(prev[peer] || []), msg],
      }));
    });
    socket.current.on("group_message", msg => {
      setGroupMessages(prev => ({
        ...prev,
        [msg.room]: [...(prev[msg.room] || []), msg],
      }));
    });
    socket.current.on("typing", ({ roomOrId, name }) => {
      setTypingStatus({ name, roomOrId });
      setTimeout(() => setTypingStatus(null), 1500);
    });
    return () => socket.current.disconnect();
  }, []);

  // Admin actions
  const handlePromoteUser = id => setUsers(users =>
    users.map(u => u.id === id ? { ...u, role: "admin" } : u)
  );
  const handleKickUser = id => setUsers(users =>
    users.map(u => u.id === id ? { ...u, status: "kicked" } : u)
  );
  const handleBanUser = id => setUsers(users =>
    users.map(u => u.id === id ? { ...u, status: "banned" } : u)
  );
  const handleUnbanUser = id => setUsers(users =>
    users.map(u => u.id === id ? { ...u, status: "active" } : u)
  );

  // Sidebar click handlers
  const handleDMSelect = user => {
    setMode("dm");
    setSelected(user);
    socket.current.emit("request_dm_history", user.id, hist => {
      setDmMessages(prev => ({ ...prev, [user.id]: hist || [] }));
    });
    setInputText("");
  };

  const handleGroupSelect = groupName => {
    setMode("group");
    setSelected({ name: groupName });
    socket.current.emit("join_group", groupName, res => {
      if (res.success) {
        setGroupMessages(prev => ({
          ...prev,
          [groupName]: res.history || [],
        }));
      }
    });
    setInputText("");
  };

  // Group modal usage
  const handleCreateGroup = () => setGroupModalOpen(true);

  const handleModalCreate = (name) => {
    if (!name) return;
    socket.current.emit("create_group", name, res => {
      if (res.success) setGroups(prev => [...prev, name]);
    });
    setGroupModalOpen(false);
  };

  // Message sending logic
  const handleSendMessage = () => {
    if (!inputText.trim() || !selected) return;
    if (mode === "dm") {
      socket.current.emit("dm_message", {
        toId: selected.id,
        text: inputText,
        time: new Date().toLocaleTimeString(),
      });
    } else if (mode === "group") {
      socket.current.emit("group_message", {
        room: selected.name,
        text: inputText,
        name: currentUser.name,
        from: socket.current.id,
        time: new Date().toLocaleTimeString(),
      });
    }
    setInputText("");
  };

  // File/image message sending logic (stub, for future)
  const handleSendFile = fileMsg => {
    if (!selected) return;
    const time = new Date().toLocaleTimeString();
    if (mode === "dm") {
      const msg = {
        from: socket.current.id,
        to: selected.id,
        time,
        ...fileMsg
      };
      setDmMessages(prev => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] || []), msg]
      }));
    } else if (mode === "group") {
      const msg = {
        room: selected.name,
        name: currentUser.name,
        from: socket.current.id,
        time,
        ...fileMsg
      };
      setGroupMessages(prev => ({
        ...prev,
        [selected.name]: [...(prev[selected.name] || []), msg]
      }));
    }
  };

  // Typing indicator logic
  const handleTyping = () => {
    const key = mode === "dm" ? selected?.id : selected?.name;
    if (key && socket.current) {
      socket.current.emit("typing", { roomOrId: key, name: currentUser.name });
    }
  };

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Login screen
  if (!currentUser) {
    return (
      <div style={{ padding: 30 }}>
        <h2>Login:</h2>
        <select
          onChange={e => {
            const u = users.find(u => u.id === e.target.value);
            if (u && u.status === "active") setCurrentUser(u);
            else alert("This user is not active.");
          }}
          defaultValue=""
        >
          <option value="" disabled>-- Select a user --</option>
          {users.map(u => (
            <option key={u.id} value={u.id} disabled={u.status !== "active"}>
              {u.name} {u.role === "admin" ? "(admin)" : ""} {u.status !== "active" ? `(${u.status})` : ""}
            </option>
          ))}
        </select>
        <label style={{ display: "block", marginTop: 20 }}>
          <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
          Enable dark mode
        </label>
      </div>
    );
  }

  // Compose messages for ChatMain
  let messages = [];
  if (mode === "dm" && selected) {
    messages = (dmMessages[selected.id] || []).map(msg => ({
      ...msg,
      isOwn: msg.from === socket.current.id,
      name: selected.name,
    }));
  } else if (mode === "group" && selected) {
    messages = (groupMessages[selected.name] || []).map(msg => ({
      ...msg,
      isOwn: msg.from === socket.current.id,
      name: msg.name,
    }));
  }

  return (
    <div className="chat-container">
      <Sidebar
        users={users}
        currentUser={currentUser}
        onDMSelect={handleDMSelect}
        onPromoteUser={handlePromoteUser}
        onKickUser={handleKickUser}
        onBanUser={handleBanUser}
        onUnbanUser={handleUnbanUser}
        groups={groups}
        onGroupSelect={handleGroupSelect}
        onCreateGroup={handleCreateGroup}
      />
      <ChatMain
        mode={mode}
        selected={selected}
        currentUser={currentUser}
        messages={messages}
        typingStatus={typingStatus}
        onSendMessage={handleSendMessage}
        inputText={inputText}
        setInputText={setInputText}
        onTyping={handleTyping}
        onSendFile={handleSendFile}
        groupUsers={[]} // You can populate this as needed
      />
      {/* Group Creation Modal */}
      <GroupCreateModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreate={handleModalCreate}
      />
      {/* Dark mode toggle button */}
      <button
        onClick={() => setDarkMode(d => !d)}
        style={{
          position: "fixed", right: 16, bottom: 16, zIndex: 10,
          background: darkMode ? "#333" : "#eee",
          color: darkMode ? "#fff" : "#111",
          border: "none", borderRadius: 24, padding: "12px 18px", cursor: "pointer", fontWeight: "bold", boxShadow: "0 2px 8px #0001"
        }}
      >{darkMode ? "☀️ Light" : "🌙 Dark"}</button>
    </div>
  );
}
