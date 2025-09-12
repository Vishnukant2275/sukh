const User = require("../models/User");

exports.attachUser = async (req, res, next) => {
  if (req.session && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).lean();
      res.locals.user = user; // EJS me directly accessible
    } catch (err) {
      console.error("Error attaching user:", err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
};
