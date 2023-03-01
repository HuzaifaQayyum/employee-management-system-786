const crypto = require('crypto');
const { Types: { ObjectId } } = require('mongoose');
const { validationResult } = require('express-validator');

const Supervisor = require('../../models/Supervisor');
const Entry = require('../../models/Entry');
const User = require('../../models/User');
const mailer = require('../../util/mailer');
const tokenGenerator = require('../../util/tokenGenerator');
const { clientUrl, companyEmailAddress, verificationTokensValidTill, itemsPerPage } = require('../../config/environment');

exports.fetchSupervisors = async (req, res, next) => { 
    const pageNo = (req.query.pageNo && parseInt(req.query.pageNo)) || 0;

    const supervisors = await Supervisor.find()
                                        .skip(itemsPerPage * pageNo)
                                        .limit(itemsPerPage)
                                        .sort({ createdAt: -1 })
                                        .lean();

    return res.status(200).json(supervisors);
};

exports.fetchTotalNoOfSupervisorsPages = async (req, res, next) => { 
    const pages = Math.ceil(await Supervisor.find().countDocuments() / itemsPerPage);
    return res.status(200).json({ pages });
};

exports.createSupervisor = async (req, res, next) => {
    validationResult(req).throw();

    const { name } = req.body;

    const existingSupervisor = await Supervisor.exists({ name });
    if (existingSupervisor) return res.status(409).json({ errorMsg: `User with same name already exists.` });

    const newSupervisor = new Supervisor({ name });
    await newSupervisor.save();

    req.io.emit('new-supervisor', newSupervisor);

    return res.status(201).json(newSupervisor);
};

exports.deleteSupervisor = async (req, res, next) => {
    const { _id } = req.params;

    const supervisor = await Supervisor.findOne({ _id }, {});
    if (!supervisor) return res.status(404).json({ errorMsg: `Supervisor not found.` });

    await Entry.deleteMany({ $or: [{ from: supervisor._id }, { to: supervisor._id }] });

    await supervisor.remove();

    req.io.emit('delete-supervisor', supervisor);

    return res.status(200).json(supervisor);
};

exports.updateSupervisor = async (req, res, next) => {
    validationResult(req).throw();

    let { _id } = req.params;
    const { name } = req.body;

    try {
        _id = ObjectId(_id);
    } catch (err) { return res.status(422).json({ errorMsg: `Invalid Id.` }); }

    const supervisor = await Supervisor.findOne({ _id });
    if (!supervisor) return res.status(404).json({ errorMsg: `Supervisor not found.` });

    if (name === supervisor.name) return res.status(422).json({ errorMsg: `Please enter new name.` });

    const existingSupervisorWithSameName = await Supervisor.exists({ name });
    if (existingSupervisorWithSameName) return res.status(409).json({ errorMsg: `User with same name already exists.` });

    await supervisor.set({ name }).save();

    req.io.emit('update-supervisor', supervisor);

    return res.status(200).json(supervisor);
};

exports.fetchTotalNoOfAccountsPages = async (req, res, next) => { 
    const pages = Math.ceil(await User.find().countDocuments() / itemsPerPage);
    return res.status(200).json({ pages });
};

exports.fetchAccounts = async (req, res, next) => {
    const pageNo = (req.query.pageNo && parseInt(req.query.pageNo)) || 0;

    const users = await User.find()
                                    .select({ emailVerificationString: 0, password: 0, __v: 0 })
                                    .skip(itemsPerPage * pageNo)
                                    .limit(itemsPerPage)
                                    .sort({ admin: -1 });

    return res.status(200).json(users);
};

exports.deleteAccount = async (req, res, next) => {
    let { _id } = req.params;

    try {
        _id = ObjectId(_id);
    } catch (err) { return res.status(422).json({ errorMsg: `Invalid Id.` }); }

    const account = await User.findById(_id);
    if (!account) return res.status(404).json({ errorMsg: `Account not found` });
    await account.remove();

    req.io.emit('delete-account', account);

    return res.status(200).json(account);
};

exports.createAccount = async (req, res, next) => { 
    validationResult(req).throw();

    const { email, isAdmin: admin } = req.body;

    const existingAccount = await User.findOne({ email, verified: true });
    if (existingAccount) return res.status(409).json({ errorMsg: `Email already exists` });
    
    const passwordResetString = crypto.randomBytes(12).toString('hex');

    const newUser = new User({ email, password: ' ', admin, verified: true, passwordResetString });
    await newUser.save();
    
    const token = tokenGenerator({ email, passwordResetString, isSettingPassword: true }, verificationTokensValidTill)

    const html = `<a href="${clientUrl}/auth/reset-password/${token}">Submit credentials</a>`;
    console.log(token);
    mailer.sendMail({
        to: email,
        from: companyEmailAddress,
        subject: `Submit Credentials`,
        html
    })

    const responseUserInfo = { _id: newUser._id, email, admin, verified: newUser.verified, createdAt: newUser.createdAt };

    req.io.emit('new-account', responseUserInfo);

    return res.status(201).json(responseUserInfo);
};

exports.updateAccount = async (req, res, next) => { 
    validationResult(req).throw();

    let { _id }= req.params;
    const { email, isAdmin: admin } = req.body;

    const account = await User.findOne({ _id, verified: true }, { email: 1, admin: 1, verified: 1, createdAt: 1 });
    if (!account) return res.status(404).json({ errorMsg: `Account not found.` });

    if (!(
        account.email !== email ||
        account.admin !== admin
        )) {
        return res.status(422).json({ errorMsg: `please modify data first.` });
    }

    account.set({ 
        email,
        admin
    });
    await account.save();

    req.io.emit('update-account', account);

    return res.status(200).json(account);
};