require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./utils/logger');

const app = express();

const { PORT = 3001, NODE_ENV = 'development' } = process.env;

app.set('port', PORT);
app.set('env', NODE_ENV);

app.use(express.json());

app.use(express.static(path.join(__dirname, './public')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
  logger.log(`Listening on Port - ${PORT}, Environment - ${NODE_ENV}`);
});
