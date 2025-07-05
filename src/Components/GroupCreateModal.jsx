import React, { useState } from "react";

export default function GroupCreateModal({ open, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = groupName.trim();
    if (name) {
      onCreate(name);
      setGroupName("");
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--modal-bg, #fff)",
          borderRadius: 10,
          padding: 24,
          minWidth: 320,
          boxShadow: "0 6px 36px #0002",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ margin: 0 }}>Create Group</h3>
        <input
          type="text"
          autoFocus
          placeholder="Group name"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
          style={{
            fontSize: 16,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={() => {
              setGroupName("");
              onClose();
            }}
            style={{
              background: "#eee",
              border: "none",
              borderRadius: 5,
              padding: "8px 20px",
              fontWeight: 500,
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "8px 20px",
              fontWeight: 500,
              cursor: groupName.trim() ? "pointer" : "not-allowed"
            }}
            disabled={!groupName.trim()}
          >
            Create
          </button>
        </div>
      </form>
      <style>{`
        body.dark-mode .modal-bg, .dark-mode form[style] {
          background: #222 !important;
          color: #fafbfc !important;
        }
      `}</style>
    </div>
  );
}
