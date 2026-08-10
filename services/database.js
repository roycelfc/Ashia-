import fs from "node:fs";
import path from "node:path";
const DATA_DIR = "./data";
function ensureFile(file, defaultData) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(defaultData, null, 2)
    );
  }
  return filePath;
}
function readJSON(file, defaultData) {
  const filePath = ensureFile(file, defaultData);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return defaultData;
  }
}
function writeJSON(file, data) {
  const filePath = ensureFile(file, {});
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}
export function getUsers() {
  return readJSON("users.json", {});
}
export function saveUsers(users) {
  writeJSON("users.json", users);
}
export function getGroups() {
  return readJSON("groups.json", {});
}
export function saveGroups(groups) {
  writeJSON("groups.json", groups);
}
export function getRelationships() {
  return readJSON("relationships.json", {});
}
export function saveRelationships(relationships) {
  writeJSON("relationships.json", relationships);
}
export function getUser(jid) {
  const users = getUsers();
  if (!users[jid]) {
    users[jid] = {
      jid,
      name: "Usuario",
      reputation: 0,
      partner: null,
      joinedAt: new Date().toISOString(),
      interactions: 0
    };
    saveUsers(users);
  }
  return users[jid];
}
export function updateUser(jid, data) {
  const users = getUsers();
  users[jid] = {
    ...getUser(jid),
    ...data
  };
  saveUsers(users);
  return users[jid];
}
