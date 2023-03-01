const { Schema, model } = require('mongoose');

const userSchema = new Schema({ 
    admin: { type: Boolean, required: true, default: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    emailVerificationString: { type: String },
    passwordResetString: { type: String },
    createdAt: { type: Date, required: true, default: Date.now() }
});

module.exports = model('users', userSchema);