const join_path = require('./util/join-path');

require('dotenv').config({ path: join_path('config', '.env')});
require('express-async-errors');
const webpush = require('web-push');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const express = require('express');
const joinPath = require('./util/join-path');


const app = express();

webpush.setVapidDetails('mailto:huzaifaacf@gmail.com', 'BLauPlTBpqrn5L-R40beLfccqSKrNgHJM9lZXg2s4N2rMEigTvsmpFNr8rPI6sVu3w4kHhyf_ySIPZ0zQKDMwHg', '_AWM3FhzLaHovfepd6ulFz26ezAIuCg5xpAmJecT2tw');

const server = http.Server(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.static(joinPath('../dist/excel-report')))
app.use(cors({ origin: '*' }));

app.use((req, res, next) => {
    req.io = io;
    return next();
});

require('./startup/route-handler')(app);

require('./startup/error-handler')(app);

require('./startup/db')(server);