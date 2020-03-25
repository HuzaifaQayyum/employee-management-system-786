const jwt_validator = require('express-jwt');
const router = require('express').Router();

const { jwtPassword } = require('../../config/environment');

const { createSupervisor, updateSupervisor, deleteSupervisor, fetchAccounts, deleteAccount } = require('./admin.controller');
const { createAndUpdateSupervisorValidator } = require('./admin.validator');

router.use(jwt_validator({ secret: jwtPassword }));
router.use((req, res, next) => req.user.admin && req.user.verified ? next() : res.status(401).end());

router.post('/supervisors', createAndUpdateSupervisorValidator, createSupervisor);
router.put('/supervisors/:_id', createAndUpdateSupervisorValidator, updateSupervisor);
router.delete('/supervisors/:_id', deleteSupervisor);
router.get('/accounts', fetchAccounts);
router.delete('/accounts/:_id', deleteAccount);

module.exports = router;