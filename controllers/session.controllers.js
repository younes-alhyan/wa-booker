const { getSession, createSession } = require("../lib/baileys/sessions");

const getSessionController = async (req, res) => {
  try {
    const id = req.user.id;
    const session = getSession(id);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json({ ...session });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const createSessionController = async (req, res) => {
  try {
    const id = req.user.id;
    const session = createSession(id);

    res.status(200).json({ ...session });
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Failed to create session" });
  }
};

module.exports = {
  getSessionController,
  createSessionController,
};
