const webpush = require('web-push');

module.exports = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err) {
        if (err.body.includes('push subscription has unsubscribed or expired.'))
            PushSubscription.deleteOne({ endpoint: err.endpoint });
    }
}