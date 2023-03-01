const { Schema, model } = require('mongoose');

const pushSubscriptionSchema = new Schema({ 
    endpoint: { type: String, required: true },
    keys: {
        auth: { type: String, required: true },
        p256dh: { type: String, required: true }
    }
});

module.exports = model('push-subscriptions', pushSubscriptionSchema);