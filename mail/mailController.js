const Otp = require("../models/otp");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function getTransporter() {
  const { token } = await oAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: token,
    },
  });
}
exports.sendOtpMail = async (to) => {
  const transporter = await getTransporter(); // ✅ fresh transporter
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpEntry = new Otp({ email: to, otp: otpCode });
  await otpEntry.save();
  await transporter.sendMail({
    from: `"Sukh - FPO Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your OTP for Signup - ${otpCode}`,
    text: `Your OTP is: ${otpCode}. Do not share it with anyone.`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Code</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      text-align: center;
    }
    h1 {
      color: #007bff;
      margin-bottom: 10px;
    }
    p {
      color: #555555;
      font-size: 16px;
      margin: 10px 0 20px;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: #28a745;
      letter-spacing: 4px;
      margin: 20px 0;
      padding: 15px 0;
      border: 2px dashed #28a745;
      border-radius: 10px;
      display: inline-block;
    }
    .footer {
      font-size: 12px;
      color: #aaaaaa;
      margin-top: 30px;
    }
    @media (max-width: 600px) {
      .container {
        margin: 20px;
        padding: 20px;
      }
      .otp-code {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📩 Verify Your Email</h1>
    <p>Hello,</p>
    <p>Use the OTP code below to complete your verification process. This code is valid for <b>10 minutes</b>.</p>
    
    <div class="otp-code">${otpCode}</div>
    
    <p>If you did not request this code, please ignore this email.</p>
    
    <div class="footer">
      © 2025 Sukh Team. This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>
`,
  });

  console.log("OTP sent:", otpCode);
  return otpCode;
};
