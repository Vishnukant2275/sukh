const User = require("../models/User");
const Product = require("../models/product");
const SellRequest = require("../models/sell");
const Contact = require("../models/contactUs");
const e = require("express");
const Post = require("../models/post");
const order = require("../models/orders");

exports.adminLoginPage = (req, res) => {
  res.render("admin/adminLogin", { title: "Admin Login" });
};
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email, role: "Admin" });
    if (!admin || admin.password !== password) {
      return res.status(401).render("admin/adminLogin", {
        title: "Admin Login",
        error: "Invalid email or password",
      });
    }

    req.session.userId = admin._id;
    req.session.role = admin.role;
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).render("admin/adminLogin", {
      title: "Admin Login",
      error: "Server error. Please try again later.",
    });
  }
};

exports.adminSignupPage = (req, res) => {
  res.render("admin/adminSignup", { title: "Admin Signup" });
};
exports.adminSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingAdmin = await User.findOne({ email, role: "Admin" });
    if (existingAdmin) {
      return res.render("admin/adminSignup", {
        title: "Admin Signup",
        error: "Admin with this email already exists",
      });
    }
    const newAdmin = new User({ name, email, password, role: "Admin" });
    await newAdmin.save();
    res.redirect("/admin/login");
  } catch (err) {
    console.error("Error during admin signup:", err);
    res.status(500).render("admin/adminSignup", {
      title: "Admin Signup",
      error: "Server error. Please try again later.",
    });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      sellRequests: await SellRequest.countDocuments(),
      queries: await Contact.countDocuments(),
      order: await order.countDocuments({ status: "PendingPaymentStatus" }),
      shipment: await order.countDocuments({ status: "PendingForShipment" }),
    };
    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats,
      admin: req.user,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.products = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("admin/products", {
      title: "Manage Products",
      products,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
// Remove this duplicate import since it's already defined above
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;

    // Multer file check
    if (!req.file) {
      return res.status(400).send("No image uploaded");
    }

    const product = new Product({
      name,
      description,
      price,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).send("Server Error");
  }
};

exports.sellRequests = async (req, res) => {
  try {
    const requests = await SellRequest.find().populate("userId");
    res.render("admin/sell-requests", {
      title: "Sell Requests",
      requests,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.queries = async (req, res) => {
  try {
    const queries = await Contact.find();
    res.render("admin/queries", {
      title: "User Queries",
      queries,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.posts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "name email");
    res.render("admin/posts", {
      title: "Community Posts",
      posts,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.redirect("/admin/posts");
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.users = async (req, res) => {
  try {
    const users = await User.find();
    res.render("admin/users", {
      title: "User Management",
      users,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// adminController.js
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.query.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    await Product.findByIdAndDelete(productId);
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const productId = req.query.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("admin/product-editing", {
      title: "Edit Product",
      product,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const id = req.params.id;
    const updateData = { name, description, price };

    if (req.file) {
      updateData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.status(200).redirect("/admin/products");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.adminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.session.userId);
    if (!admin) {
      return res.status(404).send("Admin not found");
    }
    res.render("admin/profile", {
      title: "Admin Profile",
      admin,
      isEditing: false,
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).send("Server Error");
  }
};

exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.redirect("/admin/posts");
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.rejectPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.redirect("/admin/posts");
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
