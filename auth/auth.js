'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const base64 = require('base-64');
const { UserModel } = require('../src/models/index');

UserModel.authenticateBasic = async function (username, password) {
  let user = await this.findOne({where: {username}});

  if (user) {
    let validUser = await bcrypt.compare(password, user.password);
    if (validUser) {
      return user;
    }
  }
};

async function basic(request, response, next) {
  let { authorization } = request.headers;
  if (!authorization) {
    response.status(401).send('Not Authorized');
  } else {
    let authString = authorization.split(' ')[1];
    let decodedHeaders = base64.decode(authString);
    let [username, password] = decodedHeaders.split(':');
    let validUser = await UserModel.authenticateBasic(username, password);
    if (validUser) {
      request.user = validUser;
      next();
    } else {
      response.status(401).send('Not Authorized');
    }
  }
}

const authRouter = express.Router();
const app = express();

app.use(express.json());
// Process FORM intput and put the data on req.body
app.use(express.urlencoded({ extended: true }));

// Process FORM intput and put the data on req.body
// app.use(express.urlencoded({ extended: true }));

// Signup Route -- create a new user
// Two ways to test this route with httpie
// echo '{"username":"john","password":"foo"}' | http post :3000/signup
// http post :3000/signup username=john password=foo
authRouter.post('/signup', async (request, response) => {

  try {
    request.body.password = await bcrypt.hash(request.body.password, 10);
    const record = await UserModel.create(request.body);
    response.status(200).json(record);
  } catch (error) { 
    response.status(403).send('Error Creating User'); }
});

// Signin Route -- login with username and password
// test with httpie
// http post :3000/signin -a john:foo
authRouter.post('/signin', basic, async (request, response) => {

  /*
    req.headers.authorization is : "Basic sdkjdsljd="
    To get username and password from this, take the following steps:
      - Turn that string into an array by splitting on ' '
      - Pop off the last value
      - Decode that encoded string so it returns to user:pass
      - Split on ':' to turn it into an array
      - Pull username and password from that array
  */

  let basicHeaderParts = request.headers.authorization.split(' ');  // ['Basic', 'sdkjdsljd=']
  let encodedString = basicHeaderParts.pop();  // sdkjdsljd=
  let decodedString = base64.decode(encodedString); // "username:password"
  let [username, password] = decodedString.split(':'); // username, password

  /*
    Now that we finally have username and password, let's see if it's valid
    1. Find the user in the database by username
    2. Compare the plaintext password we now have against the encrypted password in the db
    - bcrypt does this by re-encrypting the plaintext password and comparing THAT
    3. Either we're valid or we throw an error
  */
  try {
    const user = await UserModel.findOne({ where: { username: username } });
    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      response.status(200).json(user);
    }
    else {
      throw new Error('Invalid User');
    }
  } catch (error) { response.status(403).send('Invalid Login'); }

});
module.exports = authRouter;