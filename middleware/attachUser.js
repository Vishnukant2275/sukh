const User = require("../models/User");
exports.attachUser= async(req, res, next) =>{
  if (req.cookies.userId) {
    try {
      const user = await User.findById(req.cookies.userId).lean();
      res.locals.user = user;
    } catch (err) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
}
