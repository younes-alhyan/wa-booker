const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const P = require("pino");

const sessions = new Map();

/**
 * session structure:
 * {
 *   sock,
 *   qr,
 *   status,
 *   contacts
 * }
 */

async function createSession(id) {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${id}`);

  const { version } = await fetchLatestBaileysVersion();

  const session = {
    qr: null,
    status: "connecting",
    sock: null,
  };

  const sock = makeWASocket({
    version, // 🔥 IMPORTANT FIX
    auth: state,
    printQRInTerminal: true, // 🔥 FORCE QR fallback
    logger: P({ level: "silent" }),
    browser: ["Chrome", "Windows", "10"], // 🔥 ALSO IMPORTANT
  });

  session.sock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;
    // console.log(update);

    if (qr) {
      session.qr = qr;
    }

    if (connection === "open") {
      session.status = "connected";
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      session.status = "disconnected";

      if (shouldReconnect) createSession(id);
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;

      const text =
        msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (!text) continue;

      await sock.sendMessage(jid, {
        text: "[BOT]: " + text,
      });
    }
  });

  sessions.set(id, session);

  return session;
}

function getSession(id) {
  return sessions.get(id);
}

function getAllSessions() {
  return [...sessions.entries()].map(([id, s]) => ({
    id,
    status: s.status,
  }));
}

module.exports = {
  createSession,
  getSession,
  getAllSessions,
};
