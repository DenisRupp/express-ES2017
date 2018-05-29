const UserFactory = require('../factories/user.factory');
const { generateAuthToken, generateRefreshToken } = require('../../../api/services/tokenGenerator');


module.exports = async (role = 'user') => {
  let user = await UserFactory({ role }).save();
  user.refreshToken = generateRefreshToken(user);
  user = await user.save();

  return {
    user,
    authToken: generateAuthToken(user),
  };
};
