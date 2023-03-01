const mongoose = require('mongoose');

module.exports = server => {
    const mongodbConfig = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };
    
    mongoose.connect(process.env.mongodbUri, mongodbConfig, err => {
        if (err) throw err;

        const port = process.env.PORT || 4000;
        server.listen(port, _ => console.log(`Listening on port ${port}`));
    });
};