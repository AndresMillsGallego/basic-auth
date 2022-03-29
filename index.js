'use strict';

require('dotenv').config();

const server = require('./src/server');
const { sequelize }  = require('./src/models/index');


const PORT = process.env.PORT || 3001;

// make sure our tables are created, start up the HTTP server.
sequelize.sync()
  .then(() => {
    console.log('HTTP server successfully started');
    
  }).catch(error => {
    console.error('Could not start server', error);
  });

server.start(PORT);