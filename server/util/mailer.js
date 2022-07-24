const nodemailer = require('nodemailer');
const sgtransport = require('nodemailer-sendgrid-transport');


const mailer = nodemailer.createTransport({
    host: process.env.mailerHost,
    port: process.env.mailerPort,
    secure: process.env.mailerSecure || false,
    auth: { 
        user: process.env.mailerUser,
        pass: process.env.mailerPass
    }
});

module.exports = mailer;
