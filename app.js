const express = require('express');
const morgan = require('morgan');
const logger = require('./configs/winston');
const initLogger = require('./configs/logger');

const app = express();

const PORT = 3000;

app.use(initLogger(logger));
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('GOTTCHA!!!');
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});