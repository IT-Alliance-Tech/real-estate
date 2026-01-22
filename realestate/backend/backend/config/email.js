const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: "egiy oesc vktc tmfp", // Fallback App Password
  },
});

module.exports = transporter;
