const MOCK_DATA = {
  users: [
    { id: "1", role: "Admin", email: "admin@entnt.in", password: "admin123" },
    { id: "2", role: "Inspector", email: "inspector@entnt.in", password: "inspect123" },
    { id: "3", role: "Engineer", email: "engineer@entnt.in", password: "engine123" }
  ],
  ships: [
    { id: "s1", name: "Ever Given", imo: "9811000", flag: "Panama", status: "Active" },
    { id: "s2", name: "Maersk Alabama", imo: "9164263", flag: "USA", status: "Under Maintenance" }
  ],
  components: [
    { id: "c1", shipId: "s1", name: "Main Engine", serialNumber: "ME-1234", installDate: "2020-01-10", lastMaintenanceDate: "2024-03-12" },
    { id: "c2", shipId: "s2", name: "Radar", serialNumber: "RAD-5678", installDate: "2021-07-18", lastMaintenanceDate: "2023-12-01" }
  ],
  jobs: [
    { id: "j1", componentId: "c1", shipId: "s1", type: "Inspection", priority: "High", status: "Open", assignedEngineerId: "3", scheduledDate: "2025-06-15" }
  ]
};

export const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(MOCK_DATA.users));
  }
  if (!localStorage.getItem('ships')) {
    localStorage.setItem('ships', JSON.stringify(MOCK_DATA.ships));
  }
  if (!localStorage.getItem('components')) {
    localStorage.setItem('components', JSON.stringify(MOCK_DATA.components));
  }
  if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify(MOCK_DATA.jobs));
  }
};

export const getItem = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const setItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
};

export const clearAll = () => {
  localStorage.clear();
}; 