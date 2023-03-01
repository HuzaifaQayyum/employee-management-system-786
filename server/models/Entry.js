const { Schema, model } = require('mongoose');
const date = require('date-and-time');

const entrySchema = new Schema({ 
    date: { type: Date, required: true }, // transform: v => date.format(v, 'YYYY-MM-DD')
    noOfHrs: { type: Number, required: true },
    from: { type: Schema.Types.ObjectId, ref: 'supervisors', required: true }, // , transform: v => v.toString()
    to: { type: Schema.Types.ObjectId, ref: 'supervisors', required: true } // , transform: v => v.toString()
});

entrySchema.set('toObject', { transform: (doc, ret) => { 
    ret.date = date.format(ret.date, 'YYYY-MM-DD');
    ret.from = ret.from.toString();
    ret.to = ret.to.toString()
    return ret;
}});

module.exports = model('entry', entrySchema);