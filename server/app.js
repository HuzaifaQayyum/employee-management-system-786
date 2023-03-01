const join_path = require('./util/join-path');

require('dotenv').config({ path: join_path('config', '.env') });
require('express-async-errors');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');
const express = require('express');

const app = express();

const server = http.Server(app);
const io = socketIO(server);

app.use(express.json());
app.use(cors({ origin: '*' }));

app.use((req, res, next) => {
    req.io = io;
    return next();
});

require('./startup/route-handler')(app);

require('./startup/error-handler')(app);

require('./startup/db')(server);