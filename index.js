const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./db");
const app = express();

const multer = require("multer");
require("dotenv").config();

// Disk storage ki jagah memory storage use karna
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Session management
const session = require("express-session");

app.use(
  session({
    secret: "lundlele", // kuch bhi random string
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // agar HTTPS use kar rahe ho to true karna
    },
  })
);

app.use(cookieParser());
// Controllers
const authController = require("./controllers/authController");
const navController = require("./controllers/navController");
const userServiceController = require("./controllers/userServiceController");
// nodemailer setup
const mailController = require("./mail/mailController");
const adminController = require("./controllers/adminController");
// QR Code Payment

const QRCode = require("qrcode");

// QR code generate route
const payment = require("./payment/payment");
app.get("/qr/:text", payment.generateQrCode);

// Middleware
const checkLoggedIn = require("./middleware/checkLoggenIn");
const isLoggedIn = require("./middleware/isLoggedIn");
const attachUser = require("./middleware/attachUser");
const isAdmin = require("./middleware/isAdmin");
app.use(async (req, res, next) => {
  if (req.session.userId) {
    req.user = await User.findById(req.session.userId);
  }
  next();
});

app.use(attachUser.attachUser);
// Set view engine and middleware

app.set("view engine", "ejs");
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});
app.post("/login", authController.login);

app.get("/logout", authController.logout);

app.get("/signup", (req, res) => {
  res.render("signup", { title: "Signup" });
});
app.post("/signup", authController.signup);
const User = require("./models/User");
app.get("/sendOtp", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // Stop OTP sending if user exists
      return res.json({
        success: false,
        message: "User already exists, please login",
      });
    }

    // Only send OTP if user does NOT exist
    await mailController.sendOtpMail(email);

    return res.json({ success: true, message: "OTP sent to " + email });
  } catch (err) {
    console.error("Error in /sendOtp:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/verifyOtp", authController.verifyOtp);

app.get("/forgot-password", authController.forgotPassword);

app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  mailController.sendPasswordMail(email);
  res.render("forgotsuccess", { title: "Forgot Password" });
});

app.get("/", checkLoggedIn, (req, res) => {
  res.render("index", { title: "Home" });
});

// Navigation Routes
app.get("/buy", isLoggedIn, navController.buy);
// controller
app.get("/product/:id", isLoggedIn, navController.productDetails);
app.get("/purchase/:id", isLoggedIn, navController.purchasePage);
app.post("/purchase/:id", isLoggedIn, navController.handlePurchase);

app.get("/payment/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "productId"
    );

    const amount = order.quantity * order.productId.price;

    // 🔹 UPI Deeplink
    const upiLink = `upi://pay?pa=vishnukant2275@axisb&pn=EasyOrder&am=${amount}&cu=INR&tn=Order%20Payment`;

    // 🔹 Generate QR
    const qrCode = await QRCode.toDataURL(upiLink);

    res.render("payment", {
      order,
      product: order.productId,
      upiLink,
      qrCode,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating payment page");
  }
});

app.get("/sell", isLoggedIn, navController.sell);
app.post("/sell", isLoggedIn, navController.afterSell);
app.get("/profile", isLoggedIn, navController.profile);
app.get("/profile/edit", isLoggedIn, navController.editProfile);
app.post("/profile/edit", isLoggedIn, navController.updateProfile);
app.get("/home", checkLoggedIn, navController.home);
app.get("/aboutus", checkLoggedIn, navController.about);
app.get("/contact", checkLoggedIn, navController.contact);

const Contact = require("./models/contactUs");
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  const newMessage = new Contact({ name, email, message });
  await newMessage.save();
  //  mailController.sendMailAfterContactUs(email, name, message);
  res.render("contactsuccess", { title: "Contact" });
});

app.post(
  "/post",
  isLoggedIn,
  upload.single("image"),
  userServiceController.uploadPost
);

app.get("/add-post", isLoggedIn, userServiceController.addPost);
app.get("/cummunity", checkLoggedIn, userServiceController.community);
app.get("/services", userServiceController.services);
app.get("/members", userServiceController.members);

// Admin Routes - Add these before app.listen
app.get("/admin/login", adminController.adminLoginPage);
app.post("/admin/login", adminController.adminLogin);
app.get("/admin/signup", adminController.adminSignupPage);
app.post("/admin/signup", adminController.adminSignup);
app.get("/admin/dashboard", isAdmin, adminController.dashboard);
app.get("/admin/products", isAdmin, adminController.products);
app.post(
  "/admin/products",
  isAdmin,
  upload.single("image"),
  adminController.addProduct
);
app.post(
  "/admin/products/:id",
  isAdmin,
  upload.single("image"),
  adminController.updateProduct
);
app.get("/admin", isAdmin, adminController.dashboard);
app.get("/admin/editproducts", isAdmin, adminController.editProduct);

app.get("/admin/sell-requests", isAdmin, adminController.sellRequests);
app.get("/admin/queries", isAdmin, adminController.queries);
app.get("/admin/posts", isAdmin, adminController.posts);
app.post("/admin/posts", isAdmin, adminController.approvePost);
app.post("/admin/posts/:id/approve", isAdmin, adminController.approvePost);
app.post("/admin/posts/:id/reject", isAdmin, adminController.rejectPost);
app.delete("/admin/posts/:id", isAdmin, adminController.deletePost);
app.get("/admin/users", isAdmin, adminController.users);
app.delete("/admin/delete-user", isAdmin, adminController.deleteUser);
app.delete("/admin/delete-product", isAdmin, adminController.deleteProduct);
app.get("/admin/profile", isAdmin, adminController.adminProfile);
const Order = require("./models/orders");
app.get("/admin/orders/pending", async (req, res) => {
  const orders = await Order.find({ status: "PendingPaymentStatus" }).populate(
    "productId"
  );
  res.render("admin/orders", { orders });
});
app.get("/admin/orders/shipment", async (req, res) => {
  const orders = await Order.find({ status: "PendingForShipment" }).populate(
    "productId"
  );
  res.render("admin/shipment", { orders });
});

app.post("/admin/orders/:id/approve", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: "PendingForShipment",
  });
  res.redirect("/admin/orders/pending");
});

app.post("/admin/orders/:id/reject", async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, {
    status: "PaymentNotReceived",
  }); // ya phir status=Rejected bhi kar sakte ho
  res.redirect("/admin/orders/pending");
});

// ---------------- Start Server ----------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
