import supertest from "supertest";
import mongoose from "mongoose";
import { expect } from "chai";
import config from "../src/utils/config.js";
import { Account, createAccount } from '../src/models/account.js';

const HOST = 'http://localhost:8000'

describe('routes/auth/signup', () => {

  const agent = supertest.agent(HOST);

  before((done) => {
    mongoose.connect(config('MONGO_URI', 'mongodb://127.0.0.1/exampledb')).then(() => {
      done();
    });
  })

  beforeEach((done) => {
    Account.deleteMany({ email: 'unit@testing.com' }).then(() => {
      done();
    })
  })

  it("Valid signup should return token", (done) => {

    agent
      .post('/api/auth/signup')
      .send({
        email: 'unit@testing.com',
        username: 'example',
        password: 'password123!'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.token).to.not.be.null;
        expect(res.body.message).to.equal('Account was successfully created');
        done();
      })
  })

  it("Signup should return error when email taken", (done) => {

    // Create a new account and save
    const acc = new Account({
      email: 'unit@testing.com',
      username: 'example',
      display_name: 'example',
      password: 'password123!'
    })

    createAccount(acc).then(() => {
      agent
        .post('/api/auth/signup')
        .send({
          email: 'unit@testing.com', // taken already
          username: 'nottaken', // free
          password: 'password123!'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.token).to.not.be.null;
          expect(res.body.message).to.equal('An account with this email already exists');
          done();
        })
    })

  })

  it("Signup should return error when username taken", (done) => {

    // Create a new account and save
    const acc = new Account({
      email: 'unit@testing.com',
      username: 'example',
      display_name: 'example',
      password: 'password123!'
    })

    createAccount(acc).then(() => {
      agent
        .post('/api/auth/signup')
        .send({
          email: 'nottaken@gmail.com', // not taken
          username: 'example', // taken already
          password: 'password123!'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.token).to.not.be.null;
          expect(res.body.message).to.equal('An account with this username already exists');
          done();
        })
    })
  })
})

describe('routes/auth/login', () => {

  const agent = supertest.agent(HOST);

  before((done) => {
    mongoose.connect(config('MONGO_URI', 'mongodb://127.0.0.1/exampledb')).then(() => {
      done();
    });
  })

  beforeEach((done) => {
    Account.deleteMany({ email: 'unit@testing.com' }).then(() => {
      done();
    })
  })

  it("Valid login should return token", (done) => {

    // Create a new account and save
    const acc = new Account({
      email: 'unit@testing.com',
      username: 'example',
      display_name: 'example',
      password: 'password123!'
    })

    createAccount(acc).then(() => {
      agent
        .post('/api/auth/login')
        .send({
          email: 'unit@testing.com',
          password: 'password123!'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.token).to.not.be.null;
          expect(res.body.message).to.equal('Successfully logged in');
          done();
        })
    });

  })

  it("Login should return error when email does not exist", (done) => {

    agent
      .post('/api/auth/login')
      .send({
        email: 'unit@testing.com', // does not exist, as beforeEach ran
        password: 'password123!'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.token).to.not.be.null;
        expect(res.body.message).to.equal('An account with this email does not exist');
        done();
      })
  })

  it("Login should return error when password is invalid", (done) => {

    // Create a new account and save
    const acc = new Account({
      email: 'unit@testing.com',
      username: 'example',
      display_name: 'example',
      password: 'password123!'
    })

    createAccount(acc).then(() => {
      agent
        .post('/api/auth/login')
        .send({
          email: 'unit@testing.com', // exists
          password: 'password123!!' // wrong password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body.token).to.not.be.null;
          expect(res.body.message).to.equal('Incorrect login credentials');
          done();
        })
    });

  })

})