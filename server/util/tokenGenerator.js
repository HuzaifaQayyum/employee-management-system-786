const jwt = require('jsonwebtoken');

module.exports = (payload, validTill) => { 
    return jwt.sign({...payload, validTill: new Date().getTime() + validTill }, process.env.jwtPassword, { expiresIn: validTill.toString() })
};