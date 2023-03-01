const { body, param } = require('express-validator');

exports.createAndUpdateSupervisorValidator = [
    body('name')
        .trim()

        .notEmpty()
        .withMessage(`Name is required`)
];

exports.createUpdateAccountValidator = [
    body('email')
        .trim()

        .notEmpty()
        .withMessage(`Email is required`)

        .matches(/.@gmail\.com$/)
        .withMessage(`Only valid gmail account is allowed`),
        
    body('isAdmin')
        .trim()

        .notEmpty()
        .withMessage(`Is admin account property is required`)

        .isBoolean()
        .withMessage(`Is admin property must be a boolean`)

        .toBoolean()
];