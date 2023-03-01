const { Schema, model } = require('mongoose');

const supervisorSchema = new Schema({ 
    name: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now() }
});

module.exports = model('supervisors', supervisorSchema);