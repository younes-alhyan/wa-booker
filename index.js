const express = require("express");
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs");
const { createSession, getSession, getAllSessions } = require("./sessions");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/sessions", async (req, res) => {
  const id = uuid();

  await createSession(id);

  res.json({ id });
});

app.get("/sessions", (req, res) => {
  res.json(getAllSessions());
});

app.get("/sessions/:id/qr", (req, res) => {
  const session = getSession(req.params.id);

  if (!session) return res.status(404).send("Not found");

  res.json({
    qr: session.qr,
    status: session.status,
  });
});

// app.get("/sessions/:id/contacts", (req, res) => {
//   const session = getSession(req.params.id);

//   if (!session) return res.status(404).send("Not found");

//   res.json(session.contacts || []);
// });

// app.post("/sessions/:id/send", async (req, res) => {
//   const session = getSession(req.params.id);

//   if (!session) return res.status(404).send("Not found");

//   const { to, message } = req.body;

//   await session.sock.sendMessage(to, {
//     text: message,
//   });

//   res.json({ success: true });
// });

function getSavedSessions() {
  const authPath = path.join(__dirname, "auth");

  if (!fs.existsSync(authPath)) return [];

  return fs.readdirSync(authPath).filter((folder) => {
    const full = path.join(authPath, folder);
    return fs.statSync(full).isDirectory();
  });
}

app.listen(3000, async () => {
  console.log("Server running on http://localhost:3000");

  const sessionIds = getSavedSessions();

  console.log("Loading sessions:", sessionIds);

  for (const id of sessionIds) {
    await createSession(id);
  }
});
