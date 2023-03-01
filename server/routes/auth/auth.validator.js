const { body } = require('express-validator');

exports.loginSignupValidator = [
    body('email')
        .trim()

        .notEmpty()
        .withMessage(`Email is required`)

        .matches(/.@gmail\.com$/)
        .withMessage(`Please enter a valid GMAIL account`),

    body('password')
        .notEmpty({ ignore_whitespace: true })
        .withMessage(`password is required`)

        .isLength({ min: 5 })
        .withMessage(`password must be at least 5 characters long.`)
];

exports.tokenValidator = [
    body('token')
        .trim()

        .notEmpty()
        .withMessage(`Token is required`)
];

exports.ReqPassResetValidator = [
    body('email')
        .trim()

        .notEmpty()
        .withMessage(`Email is required.`)

        .matches(/.@gmail\.com$/)
        .withMessage(`Please enter a valid GMAIL account`)
];

exports.resetPasswordValidator = [
    body('token')
        .trim()

        .notEmpty()
        .withMessage(`Token is required`)

        .isJWT()
        .withMessage(`Please submit valid token`),

    body('newPassword')
        .trim()
        
        .notEmpty()
        .withMessage(`Password is required`)

        .isLength({ min: 5 })
        .withMessage(`Password must be at least 5 characters long.`),

    body('confirmNewPassword')
        .trim()
        
        .notEmpty()
        .withMessage(`Confirm Password is required`)

        .isLength({ min: 5 })
        .withMessage(`Confirm Password must be at least 5 characters long.`)

        .custom((value, { req }) => {
            if (value !== req.body.newPassword) throw new Error(`Passwords don't match`);
            return value;
        })
];