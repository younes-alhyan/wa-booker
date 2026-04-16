const { createSocket } = require("./socket");
const sessions = new Map();

function createSession(id) {
  const session = {
    qr: "",
    status: "connecting",
  };
  sessions.set(id, session);

  createSocket(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id);
}

module.exports = {
  createSession,
  getSession,
};
