/* eslint-disable arrow-body-style */
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const app = require('../../../index');
const UserFactory = require('../fixtures/user.fixture');
const { User } = require('../../models');
const authProviders = require('../../services/userProvider');

const sandbox = sinon.createSandbox();

const fakeOAuthRequest = () => Promise.resolve({
  service: 'facebook',
  id: '123',
  name: 'user',
  email: 'test@test.com',
  picture: 'test.jpg',
});

describe('Authentication API', () => {
  let dbUser;
  let user;
  let refreshToken;

  beforeEach(async () => {
    dbUser = UserFactory();
    user = UserFactory();

    console.log(user.email);

    await User.destroy({
      where: {},
      truncate: true,
    });
    console.log(dbUser.email);
    await dbUser.save();
  });

  afterEach(() => sandbox.restore());

  describe('POST /v1/auth/register', () => {
    it('should register a new user when request is ok', async () => {
      const req = {
        email: 'branstark@gmail.com',
        password: 'mypassword',
        first_name: 'Bran',
        last_name: 'Stark',
        role: 'admin',
      };

      const res = await request(app)
        .post('/v1/auth/register')
        .send(req);
      delete req.password;
      expect(res.status).to.eq(httpStatus.OK);
      expect(res.body.tokens).to.have.a.property('refresh');
      expect(res.body.tokens).to.have.a.property('auth');
      expect(res.body.user).to.include(req);
    });
  });
});
