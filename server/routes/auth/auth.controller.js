const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../../models/User');
const mailer = require('../../util/mailer');
const { 
    companyEmailAddress, 
    verificationTokensValidTill,
    mainTokenValidTill,
    clientUrl } = require('../../config/environment');

const tokenGenerator = require('../../util/tokenGenerator');

function sendEmailVerificationMail(email, token) {
    const html = `<a href="${clientUrl}/auth/verify-email/${token}">Verify Account</a>`;

    mailer.sendMail({
        to: email,
        from: companyEmailAddress,
        subject: 'Confirm Email address',
        sender: `Excel report Team`,
        html
    });
}

exports.createAccount = async (req, res, next) => {
    validationResult(req).throw();

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        if (existingUser.verified) return res.status(409).json({ errorMsg: `User already exists` });

        const passMatch = await bcrypt.compare(password, existingUser.password);
        if (!passMatch)
            await existingUser.set({ password: await bcrypt.hash(password, 12) }).save();

        const token = tokenGenerator({ email, emailVerificationString: existingUser.emailVerificationString }, verificationTokensValidTill);
        sendEmailVerificationMail(email, token);

        return res.status(200).json({ msg: `Check your email.` });
    }

    const emailVerificationString = crypto.randomBytes(12).toString('hex');
    const newUser = await new User({ email, password: await bcrypt.hash(password, 12), emailVerificationString });
    newUser.save();

    const token = tokenGenerator({ email, emailVerificationString }, verificationTokensValidTill);
    sendEmailVerificationMail(email, token);

    req.io.emit('new-account', { _id: newUser._id, email, verified: false, admin: false });

    return res.status(201).json({ msg: `Check your email.` });
};

exports.verifyUser = async (req, res, next) => {
    validationResult(req).throw();

    const { token } = req.body;
    const { email, emailVerificationString } = jwt.verify(token, process.env.jwtPassword);

    const user = await User.findOne({ email, verified: false, emailVerificationString });
    if (!user) return res.status(404).json({ errorMsg: `User not found.` });

    await user.set({ verified: true, emailVerificationString: undefined }).save();

    const { _id, verified, admin } = user;

    const authToken = tokenGenerator({ _id, email, verified, admin }, mainTokenValidTill);
    return res.status(200).json({ token: authToken });
};

exports.login = async (req, res, next) => {
    validationResult(req).throw();

    const { email, password } = req.body;

    const user = await User.findOne({ email, verified: true });

    if (user) {
        const passMatch = await bcrypt.compare(password, user.password);
        if (passMatch) {
            const { _id, verified, admin } = user;

            const token = tokenGenerator({ _id, email, verified, admin }, mainTokenValidTill);
            return res.status(200).json({ token });
        }
    }

    return res.status(401).json({ errorMsg: `Invalid Credentials.` });
};

exports.ReqPassReset = async (req, res, next) => {
    validationResult(req).throw();

    const { email } = req.body;
    const user = await User.findOne({ email, verified: true }, { _id: -1 });
    if (!user) return res.status(401).json({ errorMsg: `User not found.` });

    const passwordResetString = user.passwordResetString || crypto.randomBytes(12).toString('hex');

    await user.set({ passwordResetString }).save();

    const token = tokenGenerator({ email, passwordResetString }, verificationTokensValidTill)
    const html = `<a href="${clientUrl}/auth/reset-password/${token}">Reset password</a>`;
    mailer.sendMail({
        to: email,
        from: companyEmailAddress,
        subject: `Reset password`,
        html
    })

    return res.status(200).json({ msg: `Check your email.` })
};

exports.resetPassword = async (req, res, next) => {
    validationResult(req).throw();

    const { token, newPassword } = req.body;
    const { email, passwordResetString } = jwt.verify(token, process.env.jwtPassword);
    
    const user = await User.findOne({ email, verified: true, passwordResetString });
    if (!user) return res.status(404).json({ errorMsg: `User not found.` });

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) return res.status(422).json({ errorMsg: `Please enter different password.` });

    await user.set({ password: await bcrypt.hash(newPassword, 12), passwordResetString: undefined }).save();

    const { _id, verified, admin } = user;
    const authToken = tokenGenerator({ _id, email, verified, admin }, mainTokenValidTill);
    return res.status(200).json({ token: authToken });
};