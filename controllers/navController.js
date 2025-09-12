const mailController = require("../mail/mailController");
const Sell = require("../models/sell");
const Product = require("../models/product");
const Post = require("../models/post");
const Order = require("../models/orders");
const mongoose = require("mongoose");
exports.home = async (req, res) => {
  try {
    const posts = await Post.find({ status: "approved" })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.render("home", { posts }); // ✅ ab posts ek array hai
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send("Server Error");
  }
};

// navController.js
exports.buy = async (req, res) => {
  try {
    const products = await Product.find({}); // array of products
    res.render("buy", { title: "Buy Products", user: req.user, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
exports.productDetails = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("Product not found");
  res.render("product-details", { product });
};

// controllers/navController.js

// GET: Purchase page dikhana
exports.purchasePage = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    res.render("purchase", { product });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// POST: Purchase form handle karna
exports.handlePurchase = async (req, res) => {
  try {
    const QRCode = require("qrcode");

    const productId = await req.params.id;
    const product = await Product.findById(productId);
    const { name, mobile, quantity, paymentMethod } = req.body;
    const txnId = name.slice(0, 5) + mobile + paymentMethod;

    // Yahan aap apna order model bana ke save kar sakte ho
    // Example:
    const order = new Order({
      userId: req.session.userId, // 👈 जरूरी
      name,
      mobile,
      quantity,
      address: {
        pin: req.body.pincode,
        locality: req.body.locality,
        address: req.body.address,
        city: req.body.city,
        state: req.body.State,
        landmark: req.body.landmark,
      },

      paymentMethod,
      productId,
    });

    await order.save();

    const amount = order.quantity * product.price;
    const tn = "Payment for " + product.name + " Quantity= " + order.quantity;

    // 🔹 UPI Deeplink
    const upiLink = `upi://pay?pa=vishnukant2275@axisb&pn=EasyOrder&am=${amount}&cu=INR&tn=${
      tn + " " + txnId
    }`;

    // 🔹 Generate QR
    const qrCode = await QRCode.toDataURL(upiLink);

    res.render("paymentPage", {
      product,
      order,
      upiLink,
      qrCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.sell = (req, res) => {
  res.render("sell", { title: "Sell" });
};

exports.afterSell = (req, res) => {
  const { contact, material, quantity, location, notes } = req.body;
  const newSell = new Sell({
    userId: req.user._id,
    ContactNumber: contact,
    RawMaterialType: material,
    quantity: quantity,
    location: location,
    additionalDetails: notes,
  });
  newSell
    .save()
    .then(() => {
      res.render("sellsuccess", {
        title: "Sell",
        message: "Sell request submitted successfully!",
      });
      //mailController.sellRequestMail(req.user.email,contact,material,quantity,location,notes);
    })
    .catch((err) => {
      console.error("Error saving sell request:", err);
      res.status(500).send("Internal Server Error");
    });
};

exports.contact = (req, res) => {
  res.render("contact", { title: "Contact" });
};
exports.about = (req, res) => {
  res.render("about", { title: "About" });
};
exports.profile = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.userId }).populate(
      "productId"
    );
   const sells = await Sell.find({ userId: req.session.userId }).populate();
    res.render("profile", {
      user: req.user,
      orders,
      sells,
      isEditing: req.query.edit === "true",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.editProfile = async (req, res) => {
  const user = req.user;
  const sells = await Sell.find({ userId: req.session.userId }).populate();
  const orders = await Order.find({ userId: req.session.userId }).populate(
      "productId"
    );
  // Assuming req.user contains the logged-in user's data
  res.render("profile", {
    user: user,
    isEditing: true,
    orders ,sells// Enable edit mode
  });
};
const User = require("../models/User");
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains the logged-in user's data
    const { name, email, address, phone } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { name: name, email: email, address: address, phone: phone },
      { new: true }
    );

    res.redirect("/profile");
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Error updating profile");
  }
};
