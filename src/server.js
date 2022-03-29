'use strict';

require('dotenv').config();

const express = require('express');
const authRouter = require('../auth/auth');

const app = express();

app.use(express.json());

app.get('/', (request, response, next) => {
  response.send('King Snorlax approves and welcomes you to his server');
});

app.use(authRouter);

module.exports = {
  app,
  start: (PORT) => {
    app.listen(PORT, () => {
      console.log('Jigglypuff is listening on port ' + PORT);
    });
  },
};