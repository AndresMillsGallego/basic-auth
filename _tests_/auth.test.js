'use strict';

const supertest = require('supertest');
const server = require('../src/server');
const { sequelize } =  require('../src/models');
const base64 = require('base-64');
const request = supertest(server.app);

beforeAll (async () => {
  await sequelize.sync();
});

afterAll (async () => {
  await sequelize.drop();
});

describe ('Testing our auth routes', () => {

  test('Should allow a user to sign up with a new username and password', async () => {
    let response = await request.post('/signup').send({
      username: 'Andres',
      password: 'Very Sneaky',
    });
    
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual('Andres');
    expect(response.body.password).toBeTruthy;
    expect(response.body.password).not.toEqual('Very Sneaky');

  });

  test('Should allow a user to sign in with their existing username and password', async () => {
    let authString = 'Andres:Very Sneaky';
    let encodedString = base64.encode(authString);
    let response = await request.post('/signin').set('Authorization', `Basic ${encodedString}`);
    
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual('Andres');
  });

  test('Shout NOT allow a user to sign in when NOT authenticated', async () => {
    let response = await request.post('/signin');
    
    expect(response.status).toEqual(401);
  });
});