const jwt_validator = require('express-jwt');
const router = require('express').Router();

const { createSupervisor, updateSupervisor, deleteSupervisor, fetchAccounts, deleteAccount, createAccount, updateAccount, fetchTotalNoOfSupervisorsPages, fetchSupervisors, fetchTotalNoOfAccountsPages } = require('./admin.controller');
const { createAndUpdateSupervisorValidator, createUpdateAccountValidator } = require('./admin.validator');

router.use(jwt_validator({ secret: process.env.jwtPassword }));
router.use((req, res, next) => req.user.admin && req.user.verified ? next() : res.status(401).end());

router.get('/supervisors', fetchSupervisors);
router.get('/supervisors-no-of-pages', fetchTotalNoOfSupervisorsPages);
router.post('/supervisors', createAndUpdateSupervisorValidator, createSupervisor);
router.put('/supervisors/:_id', createAndUpdateSupervisorValidator, updateSupervisor);
router.delete('/supervisors/:_id', deleteSupervisor);
router.get('/accounts', fetchAccounts);
router.get('/accounts-no-of-pages', fetchTotalNoOfAccountsPages);
router.delete('/accounts/:_id', deleteAccount);
router.post('/accounts', createUpdateAccountValidator, createAccount);
router.put('/accounts/:_id', createUpdateAccountValidator, updateAccount);

module.exports = router;