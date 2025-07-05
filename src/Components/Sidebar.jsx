import React from "react";

export default function Sidebar({
  users,
  currentUser,
  onDMSelect,
  onPromoteUser,
  onKickUser,
  onBanUser,
  onUnbanUser,
  groups,
  onGroupSelect,
  onCreateGroup,
  groupUsersMap = {},
}) {
  const isAdmin = currentUser.role === "admin";

  const activeUsers = users.filter(
    u => u.status === "active" && u.id !== currentUser.id
  );
  const restrictedUsers = users.filter(
    u => (u.status === "banned" || u.status === "kicked") && u.id !== currentUser.id
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-info-header">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="user-avatar"
            style={{ marginRight: 12 }}
          />
          <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
          {currentUser.role === "admin" && (
            <span className="user-role-badge" style={{ marginLeft: 8 }}>
              <span role="img" aria-label="admin">👑</span> admin
            </span>
          )}
        </div>
        <button className="create-group-btn" onClick={onCreateGroup}>
          + New Group
        </button>
      </div>
      {/* Direct Messages */}
      <div className="section">
        <div className="section-header">Direct Messages</div>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
          Active Users
        </div>
        <div className="user-list">
          {activeUsers.map(u => (
            <div
              className="user-row"
              key={u.id}
              onClick={() => onDMSelect(u)}
              title={u.name}
            >
              <div className="user-info">
                <img src={u.avatar} alt={u.name} className="user-avatar" />
                <span className="user-name">{u.name}</span>
                {u.role === "admin" && (
                  <span className="user-role-badge" title="admin">👑</span>
                )}
              </div>
              {isAdmin && (
                <div className="admin-controls">
                  <button title="Promote to admin" onClick={e => { e.stopPropagation(); onPromoteUser(u.id); }}>⭐</button>
                  <button title="Kick user" onClick={e => { e.stopPropagation(); onKickUser(u.id); }}>⛔</button>
                  <button title="Ban user" onClick={e => { e.stopPropagation(); onBanUser(u.id); }}>🚫</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Restricted Users */}
        {restrictedUsers.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: "#b71c1c", margin: "14px 0 4px 0" }}>
              Restricted Users
            </div>
            {restrictedUsers.map(u => (
              <div
                className="user-row user-row-inactive"
                key={u.id}
                style={{ background: "#fff3f3", opacity: 0.7 }}
              >
                <div className="user-info">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="user-avatar"
                    style={{ filter: "grayscale(0.5)" }}
                  />
                  <span className="user-name">{u.name}</span>
                  {u.role === "admin" && (
                    <span className="user-role-badge">👑</span>
                  )}
                  <span className="user-status-badge">
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>
                </div>
                {isAdmin && (
                  <div className="admin-controls">
                    <button title="Unban/Unkick user" onClick={e => { e.stopPropagation(); onUnbanUser(u.id); }}>🔓</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Groups */}
      <div className="section">
        <div className="section-header">Groups</div>
        {groups.map(g => {
          const groupMembers = groupUsersMap?.[g] || [];
          const onlineCount = groupMembers.filter(u => u.online && u.status === "active").length;
          return (
            <div
              key={g}
              className="group-row"
              onClick={() => onGroupSelect(g)}
              style={{ padding: "8px 0", cursor: "pointer", fontWeight: 500 }}
            >
              <span className="group-name">{g}</span>
              <span style={{ marginLeft: 8, fontSize: 13, color: "#28a745" }}>
                {onlineCount} online
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
