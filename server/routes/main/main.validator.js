const { body, param } = require(`express-validator`);
const date = require('date-and-time');

const Supervisor = require('../../models/Supervisor');

exports.createAndUpdateEntryValidator = [
    body(`date`)
        .trim()

        .notEmpty()
        .withMessage(`Date is required`)

        .custom((value) => {
            const validDateFormat = date.isValid(value, 'YYYY-MM-DD');
            if (!validDateFormat) throw new Error(`Please enter valid date. Supported date format is YYYY-MM-DD`);
            return true;
        }),

    body(`noOfHrs`)
        .trim()

        .notEmpty()
        .withMessage(`No. of hours is required`)

        .custom((value) => {
            if (isNaN(value)) throw new Error(`No. of hours must be a number`);

            if (value % 1 !== 0) throw new Error(`No. of hours should not be float value`);

            if (value <= 0) throw new Error(`No. of hours must be greater than 0`);

            return true;
        })
        .toInt(),
    body('from')
        .trim()

        .notEmpty()
        .withMessage(`Transfer from supervisor field is required`)

        .custom(async (value) => await Supervisor.exists({ _id: value }) ? true : Promise.reject(`Supervisor mentioned in "from supervisor" field no longer exists.`)),

    body('to')
        .trim()

        .notEmpty()
        .withMessage(`Transfer to supervisor field is required`)

        .custom(async (value) => await Supervisor.exists({ _id: value }) ? true : Promise.reject(`Supervisor mentioned in "to supervisor" field no longer exists exists.`))
        .custom((val, { req }) => {
            if (req.body.from === val) throw new Error(`From field and To Field can not be same.`);
            return true;
        })
];

exports.getReportValidator = [
    param('from')
        .trim()

        .notEmpty()
        .withMessage(`From date field is required`)

        .custom((value) => {
            const validDateFormat = date.isValid(value, 'YYYY-MM-DD'); // 2002-12-05
            if (!validDateFormat) throw new Error(`Please enter valid date in "from date" field. Supported date format is YYYY-MM-DD`);
            return true;
        })

        .toDate(),
    param('to')
        .trim()

        .notEmpty()
        .withMessage(`To date field is required`)

        .custom((value) => {
            const validDateFormat = date.isValid(value, 'YYYY-MM-DD');
            if (!validDateFormat) throw new Error(`Please enter valid date in "to date" field. Supported date format is YYYY-MM-DD`);
            return true;
        })
        .toDate()
]

exports.notificationValidator = [
    body('subscription')
        .custom((val) => {
            if (!val) throw new Error(`Subscription is requried`);
            else if (typeof val !== 'object') throw new Error(`Subscripton should be an object`);
            else if (!val.endpoint) throw new Error(`Subscription should have an endpoint`);
            else if(!val.keys) throw new Error(`Subscription should have keys`);
            else if (!val.keys.auth) throw new Error(`Subscription should have auth key.`);
            else if (!val.keys.p256dh) throw new Error(`Subscription should have p256dh key`);

            return true;
        })
        
];