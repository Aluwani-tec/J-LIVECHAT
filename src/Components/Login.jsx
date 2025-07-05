import React, { useState } from "react";

// Example users for demo
const USERS = [
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
  // ...add more users as needed
];

export default function Login({ onLogin }) {
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  // Only show users for the selected role
  const filteredUsers = USERS.filter(
    u => u.role === role && u.status === "active"
  );

  return (
    <div className="login-page" style={{ maxWidth: 340, margin: "80px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 30 }}>
      <h2 style={{ marginBottom: 16 }}>Login to Chat</h2>
      
      <div style={{ marginBottom: 20 }}>
        <label>
          <input
            type="radio"
            name="role"
            value="admin"
            checked={role === "admin"}
            onChange={() => {
              setRole("admin");
              setSelectedUser(""); // reset user selection
            }}
          />{" "}
          Login as Admin
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="role"
            value="user"
            checked={role === "user"}
            onChange={() => {
              setRole("user");
              setSelectedUser(""); // reset user selection
            }}
          />{" "}
          Login as User
        </label>
      </div>

      {role && (
        <>
          <div style={{ marginBottom: 20 }}>
            <select
              style={{ width: "100%", padding: 10, borderRadius: 8 }}
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
            >
              <option value="" disabled>
                -- Select {role} --
              </option>
              {filteredUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <button
            style={{ width: "100%", padding: 12, borderRadius: 8, background: "#28a745", color: "#fff", fontWeight: 600, fontSize: 16, border: "none" }}
            disabled={!selectedUser}
            onClick={() => {
              const user = USERS.find(u => u.id === selectedUser);
              if (user) onLogin(user);
            }}
          >
            Login
          </button>
        </>
      )}
    </div>
  );
}
