import supertest from "supertest";
import mongoose from "mongoose";
import chai from "chai";
import config from "../src/utils/config.js";
import { Account } from '../src/models/account.js';

const HOST = 'http://localhost:8000'

describe('routes/auth/signup', () => {

  const agent = supertest.agent(HOST);

  before((done) => {
    mongoose.connect(config('MONGO_URI', 'mongodb://127.0.0.1/exampledb')).then(() => {
      Account.deleteMany({email: 'example@gmail.com'}).then(() => {
        done();
      })
    })
  })

  it("Valid signup should return token", (done) => {

    agent
      .post('/api/auth/signup')
      .send({
        email: 'example@gmail.com',
        username: 'example',
        password: 'password123!'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        done();
      })
  })

})