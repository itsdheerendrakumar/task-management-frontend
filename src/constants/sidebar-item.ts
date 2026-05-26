const role = {
  admin: "admin",
  projectManager: "projectManager",
  client: "client",
  member: "member",
};


export const userRoutes = [
  {
    label: "Dashboard",
    route: "/",
    allowedRoles: "all",
  },
  {
    label: "Messages",
    route: "/messages",
    allowedRoles: "all",
  },
  {
    label: "Notifications",
    route: "/notifications",
    allowedRoles: "all",
  },
  {
    label: "Settings",
    route: "/settings",
    allowedRoles: "all",
  },
  {
    label: "Tasks",
    route: "/tasks",
    allowedRoles: [
      role.admin,
      role.projectManager,
      role.member,
    ],
  },
  {
    label: "Kanban",
    route: "/kanban",
    allowedRoles: [
      role.admin,
      role.projectManager,
      role.member,
    ],
  },
  {
    label: "Analytics",
    route: "/analytics",
    allowedRoles: [
      role.admin,
      role.projectManager,
    ],
  },
  {
    label: "Users",
    route: "/users",
    allowedRoles: [
      role.admin,
    ],
  },
  {
    label: "Team",
    route: "/team",
    allowedRoles: [
      role.admin,
      role.projectManager,
    ],
  },
  {
    label: "Activity Logs",
    route: "/activity",
    allowedRoles: [
      role.admin,
      role.projectManager,
    ],
  },
] as const;