const User = require("../models/User");

async function checkLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();

      if (user) {
        res.locals.isLoggedIn = true;
        res.locals.user = user; // EJS me directly use karne ke liye
      } else {
        res.locals.isLoggedIn = false;
        res.locals.user = null;
      }
    } catch (err) {
      console.error("Error in checkLoggedIn:", err);
      res.locals.isLoggedIn = false;
      res.locals.user = null;
    }
  } else {
    res.locals.isLoggedIn = false;
    res.locals.user = null;
  }

  next();
}

module.exports = checkLoggedIn;
