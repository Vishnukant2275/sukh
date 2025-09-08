const Otp = require("../models/otp");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nodemailer.yourservice@gmail.com", // Your Gmail
    pass: "fckl oanw fznk aetq", // App Password (16 characters)
  },
});
exports.sendMail = async () => {
  try {
    let info = await transporter.sendMail({
      from: '"Mail" <nodemailer.yourservice@gmail.com>',
      to: "vishnukant2275@gmail.com",
      subject: "Hello from NodeMailer",
      text: "This is a test email!",
      html: "<b>This is a test email!</b>",
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.sendMailAfterContactUs = async (to, name, message) => {
  console.log(to, name, message);
  try {
    let info = await transporter.sendMail({
      from: '"Sukh Team" <nodemailer.yourservice@gmail.com>',
      to: to,
      subject: `Thanks ${name} for contacting us!`,
      text: `Hello ${name},\n\nThis is a system-generated mail.\nWe have received your message: "${message}".\nOur team will get back to you soon.\n\nRegards,\nSukh Team`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #007bff;">📩 Thank You, ${name}!</h2>
          <p style="font-size: 16px; color: #555555; text-align: center;">
            This is a system-generated confirmation email.
          </p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <p style="font-size: 15px; color: #333333; margin: 0;">
              <b>Your message:</b><br/> "${message}"
            </p>
          </div>
          <p style="font-size: 15px; color: #555555; text-align: center;">
            ✅ We have received your query. Our team will get back to you shortly.
          </p>
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
            © ${new Date().getFullYear()} Sukh Team. This is an automated message, please do not reply.
          </p>
        </div>
      </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

exports.sendOtpMail = async (to) => {
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const otpEntry = new Otp({ email: to, otp: otpCode });
    await otpEntry.save();

    let info = await transporter.sendMail({
      from: '"Sukh - FPO Portal" <nodemailer.yourservice@gmail.com>',
      to: to,
      subject: `Your OTP for Signup - ${otpCode}`,
      text: `Your OTP is: ${otpCode}. Do not share it with anyone.`,
      html: ` <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px; text-align:center;">
          <div style="max-width:500px; margin:0 auto; background:#fff; border-radius:8px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <h2 style="color:#2e7d32; margin-bottom:16px;">Welcome to Sukh Portal</h2>
            <p style="font-size:16px; color:#333; margin-bottom:20px;">
              Use the following OTP to complete your signup. This OTP is valid for the next <b>5 minutes</b>.
            </p>
            <div style="font-size:28px; font-weight:bold; letter-spacing:6px; color:#2e7d32; margin:20px 0;">
              ${otpCode}
            </div>
            <p style="font-size:14px; color:#555; margin-bottom:24px;">
              ⚠️ Do not share this OTP with anyone for your account safety.
            </p>
            <a href="#" style="display:inline-block; background:#2e7d32; color:#fff; padding:10px 20px; border-radius:4px; text-decoration:none; font-size:16px;">
              Verify Now
            </a>
            <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />
            <p style="font-size:12px; color:#999;">
              If you didn’t request this, please ignore this email.  
              <br/>© ${new Date().getFullYear()} FPO Portal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const User = require("../models/User");
exports.sendPasswordMail = async (to) => {
  try {
    const user = await User.findOne({ email: to });
    if (!user) {
      console.error("No user found with email:", to);
      return;
    }
    const password = user.password;

    let info = await transporter.sendMail({
      from: '"Password Recovery - Sukh" <nodemailer.yourservice@gmail.com>',
      to: to,
      subject: `Password Recovery`,
      text: `Your Password is: "${password}". Do not share it with anyone.`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #333333;">🔐 Password Recovery</h2>
          <p style="font-size: 16px; color: #555555; text-align: center;">
            You requested to recover your password for your <b>FPO account</b>.
          </p>
          <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="font-size: 18px; color: #333333; margin: 0;">Your Password:</p>
            <h3 style="color: #007bff; margin: 5px 0;">${password}</h3>
          </div>
          <p style="font-size: 14px; color: #777777; text-align: center;">
            ⚠️ Please keep this password safe and do not share it with anyone.
          </p>
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
            This is an automated email from <b>Sukh FPO</b>. If you did not request this, please ignore it.
          </p>
        </div>
      </div>
      `,
    });
  } catch (err) {
    console.error("Error sending password email:", err);
  }
};

exports.sellRequestMail = async (
  to,
  contact,
  material,
  quantity,
  location,
  notes
) => {
  try {
    let info = await transporter.sendMail({
      from: '"Sukh Team" <nodemailer.yourservice@gmail.com>',
      to: to,
      subject: "✅ Thanks for your Sell Request!",
      text: `Hello,

This is a system-generated mail.
We have received your Sell Request with the following details:

📞 Contact Number: ${contact}
📦 Raw Material: ${material}
🔢 Quantity: ${quantity}
📍 Location: ${location}
📝 Additional Notes: ${notes || "N/A"}

Our team will review your request and get back to you shortly.

Regards,
Sukh Team
`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #28a745;">📩 Thank You for Your Sell Request!</h2>
          <p style="font-size: 16px; color: #555555; text-align: center;">
            This is a system-generated confirmation email.
          </p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="font-size: 15px; color: #333333; margin: 0;">
              <b>Here are your request details:</b><br/><br/>
              📞 <b>Contact Number:</b> ${contact}<br/>
              📦 <b>Raw Material:</b> ${material}<br/>
              🔢 <b>Quantity:</b> ${quantity}<br/>
              📍 <b>Location:</b> ${location}<br/>
              📝 <b>Additional Notes:</b> ${notes || "N/A"}
            </p>
          </div>
          <p style="font-size: 15px; color: #555555; text-align: center;">
            ✅ We have received your sell request. Our team will review it and get back to you shortly.
          </p>
          <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #aaaaaa; text-align: center;">
            © ${new Date().getFullYear()} Sukh Team. This is an automated message, please do not reply.
          </p>
        </div>
      </div>
      `,
    });

    console.log("✅ Sell Request Mail sent: %s", info.messageId);
  } catch (err) {
    console.error("❌ Error sending sell mail:", err.message);
  }
};
