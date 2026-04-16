const { v4: uuid } = require("uuid");
// const supabase = require("../lib/supabase/db");

// async function authMiddleware(req, res, next) {
//   try {
//     const auth = req.headers.authorization;
//     if (!auth) {
//       return res.status(401).json({ error: "No token" });
//     }

//     const token = auth.replace("Bearer ", "");

//     const { data, error } = await supabase.auth.getUser(token);
//     if (error || !data.user) {
//       return res.status(401).json({ error: "Invalid token" });
//     }

//     req.user = data.user;
//     next();
//   } catch (err) {
//     res.status(500).json({ error: "Auth error" });
//   }
// }

async function authMiddleware(req, res, next) {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  req.user = { id: userId };

  next();
}

module.exports = { authMiddleware };
