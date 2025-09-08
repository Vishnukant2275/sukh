const User = require("../models/User");

async function isLoggedIn(req, res, next) {
  try {
    // Example: agar aap cookie/session use kar rahe ho
    if (!req.cookies.userId) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.cookies.userId);
    if (!user) {
      return res.redirect("/login");
    }

    req.user = user; // yahi line IMPORTANT hai
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = isLoggedIn;
