// middleware/isAdmin.js
module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.redirect("/admin/login");
  }
  next();
};
