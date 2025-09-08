exports.community =(req, res) => {
  res.render("community", { title: "Community" });
}
exports.services =(req, res) => {
  res.render("services", { title: "Services" });
}
exports.members =(req, res) => {
  res.render("members", { title: "Members" });
}
exports.addPost =(req, res) => {
  res.render("addPost", { title: "Add Post" });
}