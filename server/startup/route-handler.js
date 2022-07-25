const authRouter = require('../routes/auth/auth.router');
const mainRouter = require('../routes/main/main.router');
const adminRouter = require('../routes/admin/admin.router');
const joinPath = require('../util/join-path');

module.exports = app => { 
    app.use('/api/auth', authRouter);
    app.use('/api/main', mainRouter);
    app.use('/api/admin', adminRouter);

    app.get('/*', (req, res) => { 
        return res.sendFile(joinPath('../', 'dist', 'excel-report', 'index.html'));
    })
};