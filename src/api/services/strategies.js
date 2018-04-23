/* eslint-disable camelcase */
const axios = require('axios');
const httpStatus = require('http-status');
const { User } = require('../models');

class StrategiesError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthStrategiesError';
    this.status = httpStatus.UNAUTHORIZED;
  }
}

exports.facebook = async (access_token) => {
  try {
    const fields = 'id, name, email, picture';
    const url = 'https://graph.facebook.com/me';
    const params = { access_token, fields };
    const response = await axios.get(url, { params });
    const {
      id, email, first_name, last_name,
    } = response.data;
    return {
      service: 'facebook',
      id,
      first_name,
      last_name,
      email,
    };
  } catch (e) {
    throw new StrategiesError('Invalid google access token');
  }
};

exports.google = async (access_token) => {
  try {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const params = { access_token };
    const response = await axios.get(url, { params });
    const {
      sub, email, given_name: first_name, family_name: last_name,
    } = response.data;
    return {
      service: 'google',
      id: sub,
      first_name,
      last_name,
      email,
    };
  } catch (e) {
    throw new StrategiesError('Invalid google access token');
  }
};

exports.local = async (req, res, next) => {
  const authError = { message: 'Invalid email or password', status: httpStatus.BAD_REQUEST };
  const { email, password } = req.body;

  try {
    if (!req.body.email || !req.body.password) throw authError;
    const user = await User.findOne({ where: { email } });
    if (!user) throw authError;

    // Make sure the password is correct
    const isMatch = await user.verifyPassword(password);
    if (!isMatch) { throw authError; }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
