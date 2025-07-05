import React, { useState, useEffect, useRef } from "react";
import { createMockSocket } from "./mockSocket"; // ✅ Use mock socket only
import Sidebar from "./Sidebar";
import "./chat.css";

export default function LiveChat({ user }) {
  const socket = useRef(null);

  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [mode, setMode] = useState("dm");
  const [selected, setSelected] = useState(null);
  const [dmMessages, setDmMessages] = useState({});
  const [groupMessages, setGroupMessages] = useState({});
  const [typingStatus, setTypingStatus] = useState(null);
  const [inputText, setInputText] = useState("");
  const [unreadDMs, setUnreadDMs] = useState({});
  const [unreadGroups, setUnreadGroups] = useState({});

  const useMock = true;

  // Setup socket connection
  useEffect(() => {
    if (!socket.current) {
      socket.current = useMock
        ? createMockSocket()
        : null; // fallback omitted for mock

      socket.current.on("connect", () => {
        socket.current.emit("user_joined", user);
      });

      socket.current.on("update_users", setUsers);
      socket.current.on("group_list", setGroups);

      socket.current.on("dm_message", (msg) => {
        const peer = msg.from === socket.current.id ? msg.to : msg.from;
        setDmMessages((prev) => ({
          ...prev,
          [peer]: [...(prev[peer] || []), msg],
        }));

        // Mark as unread if not focused
        if (!(mode === "dm" && selected && selected.id === peer)) {
          setUnreadDMs((prev) => ({
            ...prev,
            [peer]: (prev[peer] || 0) + 1,
          }));
        }
      });

      socket.current.on("group_message", (msg) => {
        setGroupMessages((prev) => ({
          ...prev,
          [msg.room]: [...(prev[msg.room] || []), msg],
        }));

        // Mark as unread if not focused
        if (!(mode === "group" && selected && selected.name === msg.room)) {
          setUnreadGroups((prev) => ({
            ...prev,
            [msg.room]: (prev[msg.room] || 0) + 1,
          }));
        }
      });

      socket.current.on("typing", ({ roomOrId, name }) => {
        setTypingStatus({ name, roomOrId });
        setTimeout(() => setTypingStatus(null), 2000);
      });
    }

    return () => socket.current?.disconnect();
  }, [user, useMock, mode, selected]);

  // Auto-scroll on message update
  useEffect(() => {
    const chatBox = document.querySelector(".chat-box");
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [dmMessages, groupMessages, selected]);

  // DM: fetch history + clear unread
  const startDM = (u) => {
    setMode("dm");
    setSelected(u);
    setUnreadDMs((prev) => ({ ...prev, [u.id]: 0 }));
    socket.current.emit("request_dm_history", u.id, (hist) => {
      setDmMessages((prev) => ({ ...prev, [u.id]: hist || [] }));
    });
  };

  // Group: join + fetch history + clear unread
  const createGroup = () => {
    const name = prompt("Group name:");
    if (!name) return;
    socket.current.emit("create_group", name, (res) => {
      if (res.success) {
        setSelected({ name });
        setMode("group");
        setUnreadGroups((prev) => ({ ...prev, [name]: 0 }));
      }
    });
  };

  const joinGroup = (groupName) => {
    setUnreadGroups((prev) => ({ ...prev, [groupName]: 0 }));
    socket.current.emit("join_group", groupName, (res) => {
      if (res.success) {
        setSelected({ name: groupName });
        setMode("group");
        setGroupMessages((prev) => ({
          ...prev,
          [groupName]: res.history || [],
        }));
      }
    });

    socket.current.emit("get_group_users", groupName, setGroupUsers);
  };

  const handleSend = () => {
    if (!inputText.trim() || !selected) return;

    if (mode === "dm") {
      socket.current.emit("dm_message", {
        toId: selected.id,
        text: inputText,
        time: new Date().toLocaleTimeString(),
      });
    } else {
      socket.current.emit("group_message", {
        room: selected.name,
        text: inputText,
        name: user.name,
        from: socket.current.id,
        time: new Date().toLocaleTimeString(),
      });
    }

    setInputText("");
  };

  const handleTyping = () => {
    const key = mode === "dm" ? selected?.id : selected?.name;
    if (key && socket.current) {
      socket.current.emit("typing", { roomOrId: key, name: user.name });
    }
  };

  // Admin: Promote/Mute (example logic, handle as needed)
  const handlePromoteUser = (u) => {
    alert(`User ${u.name} promoted!`);
  };
  const handleMuteUser = (u) => {
    alert(`User ${u.name} muted!`);
  };

  const renderMessages = () => {
    if (!selected) return <p className="empty-chat">No conversation selected</p>;

    const key = mode === "dm" ? selected.id : selected.name;
    const messages = mode === "dm" ? dmMessages[key] || [] : groupMessages[key] || [];

    return messages.map((msg, i) => (
      <div key={i} className={`message-row ${msg.from === socket.current.id ? "admin" : ""}`}>
        <div className="bubble">
          <p>{msg.text}</p>
          <div className="meta">
            {mode === "dm"
              ? `${msg.from === socket.current.id ? "You" : selected.name}, ${msg.time}`
              : `${msg.name}, ${msg.time}`}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="chat-container">
      <Sidebar
        users={users.filter(u => u.id !== socket.current.id)}
        currentUser={user}
        onDMSelect={startDM}
        onCreateGroup={createGroup}
        groups={groups}
        onGroupSelect={joinGroup}
        onPromoteUser={handlePromoteUser}
        onMuteUser={handleMuteUser}
        unreadDMs={unreadDMs}
        unreadGroups={unreadGroups}
      />

      <main className="chat-main">
        <div className="chat-title">
          {mode === "dm"
            ? selected
              ? `Chat with ${selected.name}`
              : "Select a user"
            : selected
            ? `Group: ${selected.name}`
            : "Select or create a group"}
        </div>

        {mode === "group" && selected && (
          <div className="group-users-list">
            <strong>Online in {selected.name}:</strong>
            {groupUsers.map((u, i) => (
              <div key={i} className="group-user">{u.name}</div>
            ))}
          </div>
        )}

        <div className="chat-box">{renderMessages()}</div>

        {typingStatus && selected && (
          <div className="typing-indicator">{typingStatus.name} is typing...</div>
        )}

        {selected && (
          <div className="input-area">
            <input
              type="text"
              value={inputText}
              placeholder="Type a message..."
              onChange={(e) => {
                setInputText(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        )}
      </main>
    </div>
  );
}
