const authRouter = require('../routes/auth/auth.router');
const mainRouter = require('../routes/main/main.router');
const adminRouter = require('../routes/admin/admin.router');

module.exports = app => {
    app.use('/api/auth', authRouter);
    app.use('/api/main', mainRouter);
    app.use('/api/admin', adminRouter);

    app.get('/api/health-check', (req, res) => res.status(200).end());
};