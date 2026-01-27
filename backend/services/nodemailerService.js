const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, attachmentObj, html) => {
  if ((!text && !html) || (text && html)) {
    throw new Error(`Either text or html required for sending email`);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports like 587
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    ...(text && { text }),
    ...(html && { html }),
  });

  return info;
};

module.exports = {
  sendEmail,
};
