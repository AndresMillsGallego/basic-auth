'use strict';

require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const userSchema = require('./userSchema');

const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite::memory'
  : process.env.DATABASE_URL || 'postgresql://localhost:5432/api-server';

// comment out dialect options when working locally - heroku needs it
const sequelize = new Sequelize(DATABASE_URL, {
  // dialectOptions: {
  //   ssl: {
  //     require: true,
  //     rejectUnauthorized: false,
  //   },
  // },
});

const UserModel = userSchema(sequelize, DataTypes);

module.exports = {
  sequelize,
  UserModel,
};