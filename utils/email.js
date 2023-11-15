const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create transporter (Mail transporting service)
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    auth: {
      user: "38f37683e1a511",
      pass: "0948818471a46a",
    },
  });

  // Define mail options and send
  const mailOptions = {
    from: "Drive Storage <drive@mail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
