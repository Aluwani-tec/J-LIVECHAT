// src/Components/mockSocket.js
export function createMockSocket() {
  let handlers = {};
  const socket = {
    id: "mock-" + Math.random().toString(36).substring(2, 7),
    emit(event, payload, cb) {
      switch (event) {
        case "user_joined":
          mockData.currentUser = { ...payload, id: socket.id };
          // Add user to users if not already present
          if (!mockData.users.find(u => u.id === mockData.currentUser.id)) {
            mockData.users.push({ ...mockData.currentUser });
          }
          trigger("update_users", mockData.users);
          trigger("group_list", Object.keys(mockData.groups));
          break;

        case "create_group":
          if (!mockData.groups[payload]) {
            mockData.groups[payload] = {
              name: payload,
              members: [mockData.currentUser],
              messages: [],
            };
          }
          trigger("group_list", Object.keys(mockData.groups));
          cb?.({ success: true });
          break;

        case "join_group":
          const group = mockData.groups[payload];
          if (group && !group.members.find(m => m.id === mockData.currentUser.id)) {
            group.members.push(mockData.currentUser);
          }
          cb?.({ success: true, history: group.messages });
          trigger("get_group_users", payload);
          break;

        case "get_group_users":
          const groupName = payload;
          const members = mockData.groups[groupName]?.members || [];
          cb?.(members);
          break;

        case "dm_message":
          const { toId, text } = payload;
          const dm = {
            from: mockData.currentUser.id,
            to: toId,
            text,
            time: new Date().toLocaleTimeString(),
          };
          if (!mockData.dms[toId]) mockData.dms[toId] = [];
          if (!mockData.dms[dm.from]) mockData.dms[dm.from] = [];
          mockData.dms[toId].push(dm);
          mockData.dms[dm.from].push(dm); // Save sent message in sender's DM list
          trigger("dm_message", dm);
          break;

        case "request_dm_history":
          cb?.(mockData.dms[payload] || []);
          break;

        case "group_message":
          const gm = {
            ...payload,
            time: new Date().toLocaleTimeString(),
          };
          if (mockData.groups[gm.room]) {
            mockData.groups[gm.room].messages.push(gm);
            trigger("group_message", gm);
          }
          break;

        case "typing":
          trigger("typing", payload);
          break;

        // --- Admin actions ---
        case "promote_user":
          {
            const idx = mockData.users.findIndex(u => u.id === payload);
            if (idx !== -1) {
              mockData.users[idx].role = "admin";
              trigger("update_users", mockData.users);
            }
            break;
          }
        case "kick_user":
          {
            const idx = mockData.users.findIndex(u => u.id === payload);
            if (idx !== -1) {
              mockData.users[idx].status = "kicked";
              trigger("update_users", mockData.users);
            }
            break;
          }
        case "ban_user":
          {
            const idx = mockData.users.findIndex(u => u.id === payload);
            if (idx !== -1) {
              mockData.users[idx].status = "banned";
              trigger("update_users", mockData.users);
            }
            break;
          }
        case "unban_user": // also works for unkick
          {
            const idx = mockData.users.findIndex(u => u.id === payload);
            if (idx !== -1) {
              mockData.users[idx].status = "active";
              trigger("update_users", mockData.users);
            }
            break;
          }
        default:
          break;
      }
    },
    on(event, fn) {
      handlers[event] = fn;
    },
    disconnect() {
      // Optional: handle user disconnect
    },
  };

  function trigger(event, data) {
    if (handlers[event]) {
      handlers[event](data);
    }
  }

  // --- Mock users with admin, roles, status ---
  const mockData = {
    currentUser: null,
    users: [
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
    ],
    groups: {},
    dms: {},
  };

  // Initial fake connection event
  setTimeout(() => trigger("connect"), 0);

  return socket;
}
