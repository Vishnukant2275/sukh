const mailController = require("../mail/mailController");
const Sell = require("../models/sell");
const Product= require("../models/product")
exports.home =(req, res) => {
  res.render("home", { title: "home" });
}
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

exports.sell = (req, res) => {
  res.render("sell", { title: "Sell" });
}

exports.afterSell = (req, res) => {
  const { contact,material,quantity,location,notes } = req.body;
const newSell = new Sell({
  userId: req.user._id,
  ContactNumber: contact, 
  RawMaterialType: material,
  quantity: quantity,
  location: location,
  additionalDetails: notes
}
);
newSell.save()
  .then(() => {
    res.render("sellsuccess", { title: "Sell", message: "Sell request submitted successfully!" });
    //mailController.sellRequestMail(req.user.email,contact,material,quantity,location,notes);
  })
  .catch((err) => {
    console.error("Error saving sell request:", err);
    res.status(500).send("Internal Server Error");
  });}


exports.contact =(req, res) => {
  res.render("contact", { title: "Contact" });
}
exports.about =(req, res) => {
  res.render("about", { title: "About" });
} 
exports.profile =(req, res) => {
  const isEditing = false; // Flag to indicate view mode
  // In your profile route handler
  const user = req.user; // Assuming req.user contains the logged-in user's data
res.render('profile', {
  user: user,
  isEditing: req.query.edit === 'true' // Check if edit mode is requested 
})}

exports.editProfile =(req, res) => {
  const user = req.user;
   // Assuming req.user contains the logged-in user's data
  res.render('profile', { user: user,
    isEditing: true  // Enable edit mode
   });
  }
  const User = require("../models/User");
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user contains the logged-in user's data
    const { name, email,address, phone } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { name: name, email: email, address:address, phone: phone }, 
      { new: true }
    );
    
    res.redirect('/profile');
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Error updating profile');
  }
}