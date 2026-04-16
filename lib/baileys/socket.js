const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const P = require("pino");

async function createSocket(id, session, createSession) {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${id}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version, // 🔥 IMPORTANT FIX
    auth: state,
    printQRInTerminal: true, // 🔥 FORCE QR fallback
    logger: P({ level: "silent" }),
    browser: ["Chrome", "Windows", "10"], // 🔥 ALSO IMPORTANT
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", async (update) => {
    const { connection, qr, lastDisconnect } = update;
    if (qr) {
      session.qr = qr;
      session.connected = false;
    }

    if (connection === "open") session.connected = true;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        setTimeout(() => createSession(id, session), 2000);
      }
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;

      const message =
        msg.message?.conversation || msg.message?.extendedTextMessage?.text;

      if (!message) continue;

      const jid = msg.key.remoteJid;

      // get or create chat state
      let chat = session.chats.get(jid);

      if (!chat) {
        chat = { stage: "greeting" };
        session.chats.set(jid, chat);
      }

      let response = "";
      const text = message.trim().toLowerCase();

      switch (chat.stage) {
        case "greeting":
          // TODO: Get greeting message from DB
          response =
            "Hello! 👋 Welcome!\nWould you like to book an appointment? (yes/no)";
          chat.stage = "confirming";
          break;

        case "confirming":
          if (text !== "yes") {
            response = "Alright 👍 If you need anything later just message me.";
            chat.stage = "greeting";
          } else {
            // TODO: Update to preview all available free-working hours 
            response = "Great! 📅 What date works for you? (DD/MM)";
            chat.stage = "reserving";
          }
          break;

        case "reserving":
          // TODO: Check if date is available and add reservation to DB 
          const isValidDate = /^\d{2}\/\d{2}$/.test(text);
          if (!isValidDate) {
            response = "❌ Please send a valid date like DD/MM";
            break;
          }

          response = `✅ Your reservation is confirmed for ${text}`;
          chat.stage = "greeting";
          break;

        default:
          chat.stage = "greeting";
          response = "👋 Let's start again. Would you like to book?";
      }

      session.chats.set(jid, chat);

      await sock.sendMessage(jid, {
        text: response,
      });
    }
  });
}

module.exports = { createSocket };
