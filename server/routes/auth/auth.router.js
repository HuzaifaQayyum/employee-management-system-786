const router = require('express').Router();

const { createAccount, login, verifyUser, ReqPassReset, resetPassword } = require('./auth.controller');
const { loginSignupValidator, tokenValidator, ReqPassResetValidator, resetPasswordValidator } = require('./auth.validator');

router.post('/signup', loginSignupValidator, createAccount);
router.post('/login', loginSignupValidator, login);
router.post('/verify-email', tokenValidator, verifyUser);
router.post('/request-password-reset', ReqPassResetValidator, ReqPassReset )
router.put('/reset-password', resetPasswordValidator, resetPassword);

module.exports = router;