const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./db");
const app = express();
const PORT = 3000;
const multer = require("multer");

// Disk storage ki jagah memory storage use karna
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cookieParser());
// Controllers
const authController = require("./controllers/authController");
const navController = require("./controllers/navController");
const userServiceController = require("./controllers/userServiceController");
// nodemailer setup
const mailController = require("./mail/mailController");
const adminController = require("./controllers/adminController");

// Middleware
const checkLoggedIn = require("./middleware/checkLoggenIn");
const isLoggedIn = require("./middleware/isLoggedIn");
const attachUser = require("./middleware/attachUser");
//const isAdmin = require("./middleware/isAdmin");

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

app.post("/post", isLoggedIn, (req, res) => {
  res.render("post", { title: "Post" });
});

app.get("/add-post", isLoggedIn, userServiceController.addPost);
app.get("/cummunity", checkLoggedIn, userServiceController.community);
app.get("/services", userServiceController.services);
app.get("/members", userServiceController.members);

// Admin Routes - Add these before app.listen
app.get("/admin", adminController.dashboard);
app.get("/admin/products", adminController.products);
app.post("/admin/products", upload.single("image"), adminController.addProduct);
app.post(
  "/admin/products/:id",
  upload.single("image"),
  adminController.updateProduct
);

app.get("/admin/editproducts", adminController.editProduct);

app.get("/admin/sell-requests", adminController.sellRequests);
app.get("/admin/queries", adminController.queries);
app.get("/admin/posts", adminController.posts);
app.post("/admin/posts/:id/approve", adminController.approvePost);
app.get("/admin/users", adminController.users);
app.delete("/admin/delete-user", adminController.deleteUser);
app.delete("/admin/delete-product", adminController.deleteProduct);

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
