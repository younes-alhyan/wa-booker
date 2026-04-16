const { createSocket } = require("./socket");

const sessions = new Map();
const defaultSession = () => ({
  qr: "",
  connected: false,
  chats: new Map(),
});

function createSession(id, session = defaultSession()) {
  sessions.set(id, session);
  createSocket(id, session, createSession);
  return session; 
}

function getSession(id) {
  return sessions.get(id);
}

module.exports = {
  createSession,
  getSession,
};
