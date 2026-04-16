const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const sessionRouter = require("./routes/session.routes");
const { createSession } = require("./lib/baileys/sessions");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", sessionRouter);

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
  for (const id of sessionIds) {
    await createSession(id);
  }
});
