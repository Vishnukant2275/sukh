const User = require("../models/User");
const mailController = require("../mail/mailController");
const Otp = require("../models/otp");
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: DB se user find karo
    const user = await User.findOne({ email: email });

    // Step 2: Agar user hi nahi mila
    if (!user) {
      return res.render("login", { title: "Login", error: "User not found" });
    }

    // Step 3: Password check karo
    if (user.password !== password) {
      return res.render("login", { title: "Login", error: "Invalid password" });
    }

    // Step 4: Cookie me sirf userId daalna (best practice)
    res.cookie("userId", user._id.toString(), { httpOnly: true });

    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
exports.logout = (req, res) => {
  res.clearCookie("userId");
  res.redirect("/home");
};

exports.signup = async (req, res) => {

  try {
    const { name,phone, email, password, otp } = req.body;

    if (!name ||!phone || !email || !password || !otp) {
      return res.render("signup", { title: "Signup", error: "All fields are required" });
    }

    // OTP verification
    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.render("signup", { title: "Signup", error: "Invalid OTP" });
    }

    // OTP valid, delete it from DB
    await Otp.deleteOne({ _id: otpEntry._id });

    // Create user
    const newUser = new User({ name,phone, email, password });
    await newUser.save();

    // Set cookie
    res.cookie("userId", newUser._id.toString(), { httpOnly: true });

    res.redirect("/home");
  } catch (err) {
    console.error(err);
    res.status(500).render("signup", { title: "Signup", error: err.errmsg || "Server Error" });
    ;
  }
};

exports.forgotPassword = (req, res) => {
  res.render("forgot_pass", { title: "Forgot Password" });
};
exports.sendOtpMail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const existingUser = await User.findOne({ email: email });
    console.log("Existing user:", existingUser);

    if (existingUser) {
      // Return JSON and stop function immediately
      return res.json({ success: false, message: "User already exists, please login" });
    }

    // Only send OTP if user does NOT exist
    await mailController.sendOtpMail(email);

    return res.json({ success: true, message: "OTP sent to " + email });

  } catch (err) {
    console.error("Error in sendOtpMail:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP required" });
  }

  try {
    const otpEntry = await Otp.findOne({ email, otp });
    if (!otpEntry) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP valid, delete from DB
        return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
}