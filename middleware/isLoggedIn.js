const User = require("../models/User");

async function isLoggedIn(req, res, next) {
  try {
    // ✅ check session me userId hai ya nahi
    if (!req.session.userId) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.redirect("/login");
    }

    // ✅ attach user object to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = isLoggedIn;
