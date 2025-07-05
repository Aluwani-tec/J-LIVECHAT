import React, { useRef, useEffect } from "react";

// Drag & drop file helper
function getBase64(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

export default function ChatMain({
  mode,
  selected,
  currentUser,
  messages,
  typingStatus,
  onSendMessage,
  inputText,
  setInputText,
  onTyping,
  onSendFile,
  groupUsers = []
}) {
  const chatBoxRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, selected]);

  // File upload (input)
  const handleFileInput = e => {
    const file = e.target.files[0];
    if (file) {
      getBase64(file, (dataUrl) => {
        onSendFile({ fileImage: dataUrl, fileName: file.name });
      });
      e.target.value = ""; // clear
    }
  };

  // Drag & drop
  const handleDrop = e => {
    e.preventDefault();
    if (!selected) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      getBase64(file, (dataUrl) => {
        onSendFile({ fileImage: dataUrl, fileName: file.name });
      });
    }
  };

  const handleDragOver = e => e.preventDefault();

  // Online group count
  const onlineCount = groupUsers.filter(u => u.status === "active").length;

  return (
    <main className="chat-main">
      <div className="chat-title">
        {mode === "dm" && selected && `Chat with ${selected.name}`}
        {mode === "group" && selected && (
          <span>
            Group: {selected.name}{" "}
            <span title="Online users" style={{ fontSize: 14, color: "#34b233", marginLeft: 8 }}>
              ● {onlineCount} online
            </span>
          </span>
        )}
      </div>
      {/* Group online users list */}
      {mode === "group" && selected && (
        <div className="group-users-list" style={{ marginBottom: 10, fontSize: 13 }}>
          <strong>Online:</strong>{" "}
          {groupUsers.filter(u => u.status === "active").map(u => (
            <span key={u.id} className="group-user" style={{ marginRight: 8 }}>
              {u.name}
            </span>
          ))}
        </div>
      )}
      {/* Message box + drag/drop */}
      <div
        className="chat-box"
        ref={chatBoxRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ border: "2px dashed #ddd", borderRadius: 10, minHeight: 120 }}
      >
        {messages && messages.length ? (
          messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.isOwn ? "admin" : ""}`}>
              <div className="bubble">
                {/* Text */}
                {msg.text && <p>{msg.text}</p>}
                {/* Image/file */}
                {msg.fileImage && (
                  <div style={{ marginTop: 6 }}>
                    <img
                      src={msg.fileImage}
                      alt={msg.fileName || "file"}
                      className="file-image"
                      style={{ maxWidth: 240, maxHeight: 180 }}
                    />
                    <div style={{ fontSize: 12 }}>{msg.fileName}</div>
                  </div>
                )}
                <div className="meta">
                  {mode === "group"
                    ? `${msg.name}, ${msg.time}`
                    : `${msg.isOwn ? "You" : selected?.name}, ${msg.time}`}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#bbb", textAlign: "center", margin: 20 }}>
            No messages yet.
          </p>
        )}
      </div>
      {/* Typing indicator */}
      {typingStatus && selected && (
        <div className="typing-indicator">
          {typingStatus.name} is typing...
        </div>
      )}
      {/* Input & file send */}
      <div className="input-area">
        <input
          type="text"
          value={inputText}
          disabled={!selected}
          placeholder={selected ? "Type a message..." : "Select user or group to chat"}
          onChange={e => {
            setInputText(e.target.value);
            onTyping && onTyping();
          }}
          onKeyDown={e => e.key === "Enter" && onSendMessage()}
        />
        <input
          type="file"
          style={{ display: "none" }}
          id="file-upload-input"
          accept="image/*"
          onChange={handleFileInput}
          disabled={!selected}
        />
        <label
          htmlFor="file-upload-input"
          style={{
            padding: "8px 14px", border: "1px solid #bbb", borderRadius: 5, cursor: selected ? "pointer" : "not-allowed",
            background: "#fafafa", marginRight: 8, opacity: selected ? 1 : 0.4
          }}
          title={selected ? "Attach image/file" : "Select chat first"}
        >📎</label>
        <button onClick={onSendMessage} disabled={!selected || !inputText.trim()}>Send</button>
      </div>
    </main>
  );
}
