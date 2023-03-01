const jwt_validator = require('express-jwt');
const router = require('express').Router();

const { fetchSupervisors, createEntry, fetchEntries, fetchTotalNoOfPagesOfEntries, deleteEntry, getReport, updateEntry, registerNotification } = require('./main.controller');
const { createAndUpdateEntryValidator, getReportValidator, notificationValidator } = require('./main.validator');

router.use(jwt_validator({ secret: process.env.jwtPassword }));
router.use((req, res, next) => req.user.verified ? next() : res.status(401).end());

router.post('/notifications', notificationValidator, registerNotification);
router.get('/supervisors', fetchSupervisors);
router.get('/entries', fetchEntries);
router.get('/entries-no-of-pages', fetchTotalNoOfPagesOfEntries);
router.post('/entries', createAndUpdateEntryValidator, createEntry);
router.put('/entries/:_id', createAndUpdateEntryValidator, updateEntry);
router.delete('/entries/:_id', deleteEntry);
router.get('/download-report/:from/:to', getReportValidator, getReport);

module.exports = router;