import React from "react";

export default function MessageBox({ messages, selfId, isDM, selected }) {
  return (
    <div className="chat-box">
      {messages.map((m, i) => (
        <div key={i} className={`message-row ${m.from === selfId ? "admin" : ""}`}>
          <div className="bubble">
            <p>{m.text}</p>
            <div className="meta">
              {isDM
                ? m.from === selfId
                  ? "You"
                  : selected.name
                : `${m.name}, ${m.time}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
