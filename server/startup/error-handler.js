const PushSubscription = require('../models/PushSubscription');

module.exports = app => {
    app.use((req, res, next) => res.status(404).json({ errorMsg: `Route not found.` }));

    app.use(async (err, req, res, next) =>   {
        // Invalid json object error
        if (err.name === `SyntaxError`) return res.status(422).json({ errorMsg: `Invalid json object recieved.` });
        // validation error
        if (err.mapped) {
            const validationError = err.formatWith(({ msg }) => msg);
            return res.status(422).json({ ...validationError.mapped(), errorMsg: 'Please fill right information' });
        }
        // jwt error
        if ((err.name === 'JsonWebTokenError') || (err.name === 'TokenExpiredError')) return res.status(422).json({ errorMsg: err.message });
        // express jwt middleware error
        if (err.status === 401) return res.status(401).json({ errorMsg: `Invalid Token or permission denied.` });
        // server error
        console.log(err);
        return res.status(500).json({ errorMsg: 'Something went wrong' });
    });
};