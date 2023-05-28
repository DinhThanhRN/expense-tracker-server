const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `Trinh Dinh Thanh <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Send grid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {},
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(subject, message) {
    // 1) Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: message,
    };

    // 2) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendPasswordReset(resetToken) {
    await this.send(
      "Reset your password",
      `Your password reset token (valid for only 10 minutes).\n${resetToken}\nPaste this string to change password`
    );
  }
};
// const sendEmail = async (options) => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//     // Active in gmail "less secure app" option
//   });

//   // 2) Define the email options
//   const mailOptions = {
//     from: "trinhdinhthanh <test@gmail.com",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html:
//   };
//   // 3) Acctually send the email
//   await transporter.sendMail(mailOptions);
// };
