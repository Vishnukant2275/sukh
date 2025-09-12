exports.community = (req, res) => {
  res.render("community", { title: "Community" });
};
exports.services = (req, res) => {
  res.render("services", { title: "Services" });
};
exports.members = (req, res) => {
  res.render("members", { title: "Members" });
};
exports.addPost = (req, res) => {
  res.render("addPost", { title: "Add Post" });
};
const { attachUser } = require("../middleware/attachUser");
const Post = require("../models/post");
exports.uploadPost = async (req, res) => {
  try {
    const description = req.body.description;
    const userId = req.session.userId; // Assuming user ID is stored in session
    const image = req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null;
    const newPost = new Post({
      description,
      userId,
      image,
      status: "pending", // New posts are pending approval
    });
    await newPost.save();
    res.render("post", { title: "Post Submitted" });
  } catch (err) {
    console.error("Error uploading post:", err);
    res.status(500).send("Server Error");
  }
};
