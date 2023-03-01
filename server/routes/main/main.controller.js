const webpush = require('web-push');
const excel = require('exceljs');
const { validationResult } = require('express-validator');
const { Types: { ObjectId } } = require('mongoose');

const Entry = require('../../models/Entry');
const Supervisor = require('../../models/Supervisor');
const PushSubscription = require('../../models/PushSubscription');

const { itemsPerPage } = require('../../config/environment');
const sendNotification = require('../../util/notification-sender');

exports.fetchSupervisors = async (req, res, next) => {
    const supervisors = await Supervisor.find()
        .sort({ _id: -1 })
        .limit(50)
        .lean();

    return res.status(200).json(supervisors);
};

exports.createEntry = async (req, res, next) => {
    validationResult(req).throw();
    const { date, noOfHrs, from, to } = req.body;

    const entry = new Entry({ date, noOfHrs, from, to });
    await entry.save();

    await Entry.populate(entry, { path: 'from', select: 'name 1' });
    await Entry.populate(entry, { path: 'to', select: 'name 1' });

    req.io.emit('new-entry', entry);

    const pushSubscriptions = await PushSubscription.find();

    for (const subscription of pushSubscriptions)
        await sendNotification(subscription, { title: `New entry.`, body: `New Entry created.`, adminId: req.user._id, dontShowToAdmin: true });

    return res.status(201).json(entry);
};


exports.fetchEntries = async (req, res, next) => {
    const pageNo = (req.query.pageNo && parseInt(req.query.pageNo)) || 0;

    const entries = await Entry.find()
        .skip(itemsPerPage * pageNo) // 1
        .limit(itemsPerPage)
        .populate('from', { name: 1 })
        .populate('to', { name: 1 })
        .lean();

    return res.status(200).json(entries);
};

exports.fetchTotalNoOfPagesOfEntries = async (req, res, next) => {
    const pages = Math.ceil(await Entry.find().countDocuments() / itemsPerPage);
    return res.status(200).json({ pages });
};

exports.deleteEntry = async (req, res, next) => {
    let { _id } = req.params;

    try {
        _id = ObjectId(_id);
    } catch (err) { return res.status(422).json({ errorMsg: `Invalid Id.` }); }

    const entry = await Entry.findOneAndDelete({ _id });
    if (!entry) return res.status(404).json({ errorMsg: `Entry not found.` });

    req.io.emit('delete-entry', entry);

    return res.status(200).json(entry);
}

exports.updateEntry = async (req, res, next) => {
    validationResult(req).throw();

    let { _id } = req.params;
    const { date, noOfHrs, from, to } = req.body;

    try {
        _id = ObjectId(_id);
    } catch (err) { return res.status(422).json({ errorMsg: `Invalid Id.` }); }

    const entry = await Entry.findById(_id);
    if (!entry) return res.status(404).json({ errorMsg: `Entry no longer exists.` });

    const entryObj = entry.toObject();

    if (!(
        entryObj.from.toString() !== from ||
        entryObj.to.toString() !== to ||
        entryObj.noOfHrs !== noOfHrs ||
        entryObj.date !== date
    )) return res.status(422).json({ errorMsg: `Please make some changes to update entry` });


    entry.set({
        'from': from,
        'to': to,
        'noOfHrs': noOfHrs,
        'date': date
    });
    await entry.save();

    await Entry.populate(entry, { path: 'from', select: 'name 1' });
    await Entry.populate(entry, { path: 'to', select: 'name 1' });

    req.io.emit('update-entry', entry);

    return res.status(200).json(entry);
};

exports.getReport = async (req, res, next) => {
    validationResult(req).throw();

    const { from, to } = req.params;

    const toEntries = await Entry.aggregate([
        {
            $match: {
                date: {
                    $gte: from,
                    $lte: to
                }
            }
        },
        {
            $lookup: {
                from: 'supervisors',
                localField: 'to',
                foreignField: '_id',
                as: 'to'
            }
        },
        {
            $unwind: { path: "$to" }
        },
        {
            $group: {
                _id: "$to.name",
                noOfHrs: { $sum: "$noOfHrs" }
            }
        }
    ]);

    const fromEntries = await Entry.aggregate([
        {
            $match: {
                date: {
                    $gte: from,
                    $lte: to
                }
            }
        },
        {
            $lookup: {
                from: 'supervisors',
                localField: 'from',
                foreignField: '_id',
                as: 'from'
            }
        },
        {
            $unwind: { path: "$from" }
        },
        {
            $group: {
                _id: "$from.name",
                noOfHrs: { $sum: "$noOfHrs" }
            }
        }
    ]);


    for (let fromEntry of fromEntries) {
        const index = toEntries.findIndex(e => e._id === fromEntry._id);
        if (index > -1) toEntries[index].noOfHrs -= fromEntry.noOfHrs;
        else toEntries.push({ ...fromEntry, noOfHrs: 0 - fromEntry.noOfHrs });
    }


    const wb = new excel.Workbook();

    const userWorkRecord = wb.addWorksheet('user-record', { views: [{ state: 'frozen', ySplit: 1 }] });

    userWorkRecord.columns = [
        { header: 'Name', key: 'name', width: 30 },
        { header: 'No. of Hours', key: 'noOfHrs', width: 30 }
    ];

    for (let entry of toEntries)
        userWorkRecord.addRow({ name: entry._id, noOfHrs: entry.noOfHrs });

    for (let row = 1; row <= userWorkRecord.rowCount; row++)
        for (let cols = 1; cols <= userWorkRecord.columnCount; cols++)
            userWorkRecord.getCell(row, cols).alignment = { horizontal: "center", vertical: "center" }

    await wb.xlsx.write(res);
    return res.end();
};

exports.registerNotification = async (req, res, next) => {
    validationResult(req).throw();

    const { subscription } = req.body;
    const newPushSubs = new PushSubscription(subscription);
    await newPushSubs.save();

    return res.status(201).json(newPushSubs);
};


/* Solution Two **/
// const entries = await Entry.aggregate([
//     {
//         $match: {
//             date: {
//                 $gte: from,
//                 $lte: to
//             }
//         }
//     },
//     {
//         $lookup: {
//             from: 'supervisors',
//             localField: 'to',
//             foreignField: '_id',
//             as: 'to'
//         }
//     },
//     {
//         $unwind: { path: "$to" }
//     },
//     {
//         $lookup: {
//             from: 'supervisors',
//             localField: 'from',
//             foreignField: '_id',
//             as: 'from'
//         }
//     },
//     {
//         $unwind: { path: "$from" }
//     }
// ]);


// const processedEntries = [];

// for (const entry of entries) { 
//     const existingElement = processedEntries.find(e => e._id === entry.to._id);
//     if (existingElement) existingElement.noOfHrs += entry.noOfHrs;
//     else processedEntries.push({ _id: entry.to._id.toString(), name: entry.to.name, noOfHrs: entry.noOfHrs });
// }

// for (const entry of entries) { 
//     const existingElement = processedEntries.find(e => e._id === entry.from._id.toString())
//     if (existingElement) existingElement.noOfHrs -= entry.noOfHrs;
//     else processedEntries.push({ _id: entry.from._id, name: entry.from.name, noOfHrs: entry.noOfHrs });
// }

// return res.status(200).json(processedEntries);