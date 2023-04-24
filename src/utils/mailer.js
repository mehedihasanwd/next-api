const nodemailer = require("nodemailer");

const sendEmail = (body, res, message) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE, //comment this line if you use custom server/domain
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    //comment out this one if you use custom server/domain
    // tls: {
    //   rejectUnauthorized: false,
    //   rejectUnauthorized: false,
    // },
  });

  transporter.verify((err, success) => {
    if (err) {
      console.log("Error message: ", err.message);
      return res
        .status(403)
        .send({ message: `Error happen while verifying ${err.message}` });
    } else {
      console.log(`Server is ready to take our messages`);
    }
  });

  transporter.sendMail(body, (err, data) => {
    if (err) {
      console.log(err.message);
      return res
        .status(403)
        .send({ message: `Error happen while sending email ${err.message}` });
    } else {
      return res.status(200).send({ message });
    }
  });
};

module.exports = { sendEmail };
